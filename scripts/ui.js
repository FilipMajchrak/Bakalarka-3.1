window.onload = () => 
{
    let globalInput = {};
    let loopId = null;

    function renderGlobals(variables) 
    {
        const tableBody = document.querySelector("#globals-table tbody");

        for (const [name, value] of Object.entries(variables)) 
        {
            let row = tableBody.querySelector(`tr[data-name="${name}"]`);
            if (!row) 
            {
                row = document.createElement("tr");
                row.dataset.name = name;
                row.innerHTML = `<td>${name}</td>
                    <td><input type="text" data-name="${name}"></td>`;
                const input = row.querySelector("input");
                input.addEventListener("input", e => 
                {
                    const val = e.target.value;
                    globalInput[name] = isNaN(val) ? val : parseFloat(val);
                });
                tableBody.appendChild(row);
            }
            const input = row.querySelector("input");
            if (document.activeElement !== input) { input.value = value; }
        }
    }

    document.getElementById("run").addEventListener("click", () => 
    {
        if (loopId) return;

        loopId = setInterval(() => 
        {
            const code = window.editor.getValue();
            const result = runST(code, globalInput);

            if (Object.keys(globalInput).length === 0) 
            {
                globalInput = { ...result.globalVariables };
            }

            for (const [name, val] of Object.entries(result.globalVariables)) 
            {
                const input = document.querySelector(`input[data-name="${name}"]`);
                if (input && document.activeElement !== input) 
                {
                    globalInput[name] = val;
                }
            }

            renderGlobals(globalInput);

            document.getElementById("output").innerHTML = "<pre>" + JSON.stringify(result.variables, null, 2) + "</pre>";
        }, 500);

        const runBtn = document.getElementById("run");
        runBtn.classList.remove("btn-primary");
        runBtn.classList.add("btn-success");
    });

    document.getElementById("stop").addEventListener("click", () => 
    {
        clearInterval(loopId);
        loopId = null;

        const runBtn = document.getElementById("run");
        runBtn.classList.remove("btn-success");
        runBtn.classList.add("btn-primary");
    });
};