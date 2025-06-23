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
        // Deklaracia premennej v ramci VAR alebo VAR_GLOBAL
        if ((inVar || inGlobalVar) && executing) 
            {
                const match = line.match(/(\w+)\s*:\s*\w+\s*(?::=)?\s*(-?\d+)?;/);
                if (match) {
                const [, name, value] = match;
                const val = value !== undefined ? parseInt(value) : 0;
                variables[name] = val;
                if (inGlobalVar) globalVariables[name] = val;
                }
            }
        // Priradenie hodnoty do premennej
        else if (executing) 
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