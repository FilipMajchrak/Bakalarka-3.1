function evalExpr(expr, variables) 
{
    let evaluated = expr.trim();

    if (/^".*"$/.test(evaluated)) 
    {
        return evaluated.slice(1, -1);
    }

    if (/^(TRUE|true)$/.test(evaluated)) return true;
    if (/^(FALSE|false)$/.test(evaluated)) return false;

    for (const [key, value] of Object.entries(variables)) 
    {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluated = evaluated.replace(regex, value);
    }

    const unknowns = evaluated.match(/\b[a-zA-Z_]\w*\b/g)?.filter(id => !(id in variables));
    if (unknowns && unknowns.length > 0) 
    {
        console.warn("Nedefinovane premenne:", unknowns);
        return NaN;
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

window.runST = function(code, inputGlobals = {}) 
{
    const lines = code.trim().split('\n');
    let inVar = false;
    let inGlobalVar = false;
    const variables = { ...inputGlobals };
    const globalVariables = { ...inputGlobals };
    let executing = true;
    let ifStack = [];

    let inCase = false;
    let caseValue = null;
    let caseMatched = false;
    let caseFound = false;

    for (let i = 0; i < lines.length; i++) 
    {
        let line = lines[i].trim();

        if (line === "VAR") { inVar = true; continue; }
        if (line === "VAR_GLOBAL") { inGlobalVar = true; continue; }
        if (line === "END_VAR") { inVar = false; inGlobalVar = false; continue; }

        if (line.startsWith("IF ") && line.endsWith("THEN")) 
        {
            const condition = evalExpr(line.slice(3, -4).trim(), variables);
            ifStack.push(condition);
            executing = condition; continue;
        }

        if (line === "ELSE" && !inCase) 
        {
            if (ifStack.length > 0) { executing = !ifStack[ifStack.length - 1]; }
            continue;
        }

        if (line === "END_IF") 
        {
            ifStack.pop();
            executing = ifStack.length === 0 || ifStack[ifStack.length - 1];
            continue;
        }

        if (line.startsWith("CASE ") && line.includes("OF")) 
        {
            const expr = line.slice(5, line.indexOf("OF")).trim();
            caseValue = evalExpr(expr, variables);
            inCase = true; caseMatched = false; caseFound = false; continue;
        }

        if (inCase && line.match(/^\d+\s*:/)) 
        {
            const [valStr, ...rest] = line.split(':');
            const val = parseInt(valStr.trim());
            caseMatched = caseValue === val; caseFound = caseMatched || caseFound;

            if (caseMatched && rest.length > 0) 
            {
                const assignment = rest.join(':').trim();
                const match = assignment.match(/(\w+)\s*:=\s*(.+);?/);
                if (match) 
                {
                    const [, name, expr] = match;
                    variables[name] = evalExpr(expr, variables);
                    if (globalVariables.hasOwnProperty(name)) { globalVariables[name] = variables[name]; }
                }
            }
            continue;
        }

        if (inCase && line.startsWith("ELSE")) 
        {
            if (!caseFound) { caseMatched = true; caseFound = true; }
            else { caseMatched = false; }
            const rest = line.slice(4).trim();
            if (caseMatched && rest) 
            {
                const match = rest.match(/(\w+)\s*:=\s*(.+);?/);
                if (match) 
                {
                    const [, name, expr] = match;
                    variables[name] = evalExpr(expr, variables);
                    if (globalVariables.hasOwnProperty(name)) { globalVariables[name] = variables[name]; }
                }
            }
            continue;
        }

        if (inCase && caseMatched && line.match(/^\w+\s*:=/)) 
        {
            const match = line.match(/(\w+)\s*:=\s*(.+);/);
            if (match) 
            {
                const [, name, expr] = match;
                variables[name] = evalExpr(expr, variables);
                if (globalVariables.hasOwnProperty(name)) { globalVariables[name] = variables[name]; }
            }
            continue;
        }

        if (inCase && line === "END_CASE") 
        {
            inCase = false; caseValue = null; caseMatched = false; continue;
        }

        if ((inVar || inGlobalVar) && executing) 
        {
            const match = line.match(/(\w+)\s*:\s*(\w+)\s*(?::=)?\s*([^;]*)?;/);
            if (match) 
            {
                const [, name, type, rawValue] = match;
                let val = 0;

                switch (type.toUpperCase()) 
                {
                    case "INT": case "WORD": val = parseInt(rawValue) || 0; break;
                    case "REAL": val = parseFloat(rawValue) || 0.0; break;
                    case "BOOL": val = rawValue?.toUpperCase() === "TRUE"; break;
                    case "STRING": val = rawValue ? rawValue.replace(/^"|"$/g, '') : ""; break;
                    default: val = 0;
                }

                if (!(inGlobalVar && inputGlobals.hasOwnProperty(name))) 
                {
                    variables[name] = val;
                    if (inGlobalVar) { globalVariables[name] = val; }
                }
            }
        } 
        else if (!inCase && executing) 
        {
            const match = line.match(/(\w+)\s*:=\s*(.+);/);
            if (match) 
            {
                const [, name, expr] = match;
                variables[name] = evalExpr(expr, variables);
                if (globalVariables.hasOwnProperty(name)) { globalVariables[name] = variables[name]; }
            }
        }
    }

    return { variables, globalVariables };
};