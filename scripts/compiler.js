window.onload = () => {

    // Inicializacia CodeMirror editora
    const editor = CodeMirror.fromTextArea(document.getElementById("editor"), 
    {
        lineNumbers: true,
        mode: "text/x-csrc",
        theme: "default"
    });

    // Funkcia na vyhodnotenie vyrazu s premennymi
    function evalExpr(expr, variables) {
        let evaluated = expr;

        // Ak ide o string v úvodzovkách, vráť ho ako text (bez eval)
        if (/^".*"$/.test(evaluated.trim())) 
        {
            return evaluated.trim().slice(1, -1); // odstráni úvodzovky
        }

        for (const [key, value] of Object.entries(variables)) 
        {
            // Nahrad iba existujuce premenne
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evaluated = evaluated.replace(regex, value);
        }

        // Zabezpec, ze sa nepouzivaju nezname premenne
        const unknowns = evaluated.match(/\b[a-zA-Z_]\w*\b/g)?.filter(id => !(id in variables));
        if (unknowns && unknowns.length > 0) 
        {
            console.warn("Nedefinovane premenne:", unknowns);
            return NaN; // alebo 0 alebo vyhodit chybu
        }

        try 
        {
            return eval(evaluated);
        } 
        catch 
        {
            return NaN;
        }
    }

    // Funkcia na simulaciu ST kodu
    function runST(code) 
    {
        const lines = code.trim().split('\n');
        let inVar = false;
        let inGlobalVar = false;
        const variables = {};
        const globalVariables = {};
        let executing = true;
        let ifStack = [];

        let inCase = false;
        let caseValue = null;
        let caseMatched = false;

        for (let i = 0; i < lines.length; i++) 
        {
            let line = lines[i].trim();

            // Detekcia blokov VAR a VAR_GLOBAL
            if (line === "VAR") { inVar = true; continue; }
            if (line === "VAR_GLOBAL") { inGlobalVar = true; continue; }
            if (line === "END_VAR") { inVar = false; inGlobalVar = false; continue; }

            // IF podmienka
            if (line.startsWith("IF ") && line.endsWith("THEN")) 
            {
                const condition = line.slice(3, -4).trim();
                const result = evalExpr(condition, variables);
                ifStack.push(result);
                executing = result;
                continue;
            }

            // ELSE
            if (line === "ELSE") 
            {
                if (ifStack.length > 0) 
                {
                    executing = !ifStack[ifStack.length - 1];
                }
                continue;
            }

            // END_IF
            if (line === "END_IF") 
            {
                ifStack.pop();
                executing = ifStack.length === 0 || ifStack[ifStack.length - 1];
                continue;
            }

            //CASE podmienka
            if(line.startsWith("CASE ") && line.endsWith("OF"))
            {
                const expr = line.slice(5, line.indexOf("OF")).trim(); //vyraz medzi CASE a OF
                caseValue = evalExpr(expr,variables); //zisti ci premenna existuje a vyhodnoti jej hodnotu
                inCase = true; //nastavy ze sme vo vnutry CASE
                caseMatched = false; //stav sa nasiel
                continue;
            }

            //CASE vetvy
            if (inCase && line.match(/^\d+\s*:/)) 
            {
                const [valStr] = line.split(":");
                const val = parseInt(valStr.trim());
                caseMatched = caseValue === val;
                continue;
            }

            //END_CASE

            if (inCase && line === "END_CASE") 
            {
                inCase = false;
                caseValue = null;
                caseMatched = false;
                continue;
            }

            //ELSE vetva CASE
            if (inCase && line === "ELSE") 
            {
                caseMatched = true; // vykona sa len ak nic nenaslo predtym
                continue;
            }

            // Deklaracia premennej v ramci VAR alebo VAR_GLOBAL
            if ((inVar || inGlobalVar) && executing) 
            {
                const match = line.match(/(\w+)\s*:\s*(\w+)\s*(?::=)?\s*([^;]*)?;/);
                if (match) 
                {
                    const [, name, type, rawValue] = match;
                    let val = 0;

                    switch (type.toUpperCase()) 
                    {
                        case "INT":
                        case "WORD":
                            val = parseInt(rawValue) || 0;
                            break;
                        case "REAL":
                            val = parseFloat(rawValue) || 0.0;
                            break;
                        case "BOOL":
                            val = rawValue?.toUpperCase() === "TRUE";
                            break;
                        case "STRING":
                            val = rawValue ? rawValue.replace(/^"|"$/g, '') : "";
                            break;
                        default:
                            val = 0;
                    }

                    variables[name] = val;
                    if (inGlobalVar) globalVariables[name] = val;
                }
            }

            // Priradenie hodnoty do premennej
            else if (executing && (!inCase || caseMatched)) // vychádza z IF/ELSE logiky, kontroluje, či aktuálna CASE vetva sa má vykonať príkazy sa -> vykonávajú len ak platí oboje
            {
                const match = line.match(/(\w+)\s*:=\s*(.+);/);
                if (match) 
                {
                    const [, name, expr] = match;
                    variables[name] = evalExpr(expr, variables);
                    if (globalVariables.hasOwnProperty(name)) 
                    {
                        globalVariables[name] = variables[name];
                    }
                }
            }
        }

        return { variables, globalVariables };
    }

    // Zobrazenie globalnych premennych v tabulke
    function renderGlobals(variables) 
    {
        const tableBody = document.querySelector("#globals-table tbody");
        tableBody.innerHTML = "";
        for (const [name, value] of Object.entries(variables)) 
        {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${name}</td><td>${value}</td>`;
            tableBody.appendChild(row);
        }
    }

    // Spustenie simulacie po kliknuti na tlacidlo
    document.getElementById("run").addEventListener("click", () => {
        const code = editor.getValue();
        const result = runST(code);
        document.getElementById("output").innerHTML = "<pre>" + JSON.stringify(result.variables, null, 2) + "</pre>";
        renderGlobals(result.globalVariables);
    });
};