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

                if (typeof value === "boolean") 
                {
                    row.innerHTML = `
                        <td class="align-middle">${name}</td>
                        <td>
                            <button type="button" class="btn btn-sm w-100" data-name="${name}"></button>
                        </td>`;

                    const btn = row.querySelector("button");
                    btn.addEventListener("click", () => 
                    {
                        globalInput[name] = !globalInput[name];
                        updateBoolButton(btn, globalInput[name]);
                    });
                } 
                else 
                {
                    row.innerHTML = `
                        <td class="align-middle">${name}</td>
                        <td>
                            <input type="text" class="form-control form-control-sm" data-name="${name}">
                        </td>`;

                    const input = row.querySelector("input");
                    input.addEventListener("input", e => 
                    {
                        const val = e.target.value;
                        globalInput[name] = isNaN(val) ? val : parseFloat(val);
                    });
                }

                tableBody.appendChild(row);
            }

            if (typeof value === "boolean") 
            {
                const btn = row.querySelector("button");
                updateBoolButton(btn, value);
            } 
            else 
            {
                const input = row.querySelector("input");
                if (document.activeElement !== input) 
                {
                    input.value = value;
                }
            }
        }
    }

    function updateBoolButton(btn, val) 
    {
        btn.classList.remove("btn-success", "btn-danger");
        btn.classList.add("btn-sm");

        if (val) 
        {
            btn.classList.add("btn-success");
            btn.textContent = "TRUE";
        } 
        else 
        {
            btn.classList.add("btn-danger");
            btn.textContent = "FALSE";
        }
    }

    document.getElementById("run").addEventListener("click", () => 
    {
        if (loopId) return;

        loopId = setInterval(() => 
        {
            const code = window.editor.getValue();
            const result = runST(code, globalInput);

            // ✅ Prepíš celý stav
            globalInput = { ...result.globalVariables };

            renderGlobals(globalInput);

            document.getElementById("output").innerHTML =
                "<pre>" + JSON.stringify(result.variables, null, 2) + "</pre>";
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