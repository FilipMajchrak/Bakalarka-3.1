window.onload = () => 
{
    
    window.globalInput = {};
    let loopId = null;

    function renderGlobals(variables) 
    {
        
        const tableBody = document.querySelector("#globals-table tbody");
        tableBody.innerHTML = ""; // vyčisti predtým ako začneš pridávať riadky

        for (const [name, value] of Object.entries(variables)) 
        {
            const row = document.createElement("tr");
            row.dataset.name = name;

            if (typeof value === "boolean") 
            {
                row.innerHTML = `
                <td class="align-middle">${name}</td>
                <td><button type="button" class="btn btn-sm w-100" data-name="${name}"></button></td>`;

                const btn = row.querySelector("button");
                updateBoolButton(btn, value);

                btn.addEventListener("click", () => 
                {
                    variables[name] = !variables[name];
                    updateBoolButton(btn, variables[name]);
                });
            } 
            else 
            {
                row.innerHTML = `
                <td class="align-middle">${name}</td>
                <td><input type="text" class="form-control form-control-sm" data-name="${name}"></td>`;

                const input = row.querySelector("input");
                input.value = value;

                input.addEventListener("input", e => 
                {
                    variables[name] = isNaN(e.target.value) ? e.target.value : parseFloat(e.target.value);
                });
            }

            tableBody.appendChild(row);
        }
    }

    //pomocná funkcia na nastavenie tlačidla bool:
    function updateBoolButton(btn, val) 
    {
        if (val) 
        {
            btn.classList.remove("btn-danger");
            btn.classList.add("btn-success");
            btn.textContent = "TRUE";
        } 
        else 
        {
            btn.classList.remove("btn-success");
            btn.classList.add("btn-danger");
            btn.textContent = "FALSE";
        }
    }
    

    //start simulation tlacidlo
    document.getElementById("run").addEventListener("click", () => 
    {
        if (loopId) return;

        window.editor.setOption("readOnly", true);

        loopId = setInterval(() => {
            try 
            {
                const code = window.editor.getValue();
                console.log("Kód zo ST editora:", code);

                const result = runST(code, window.globalInput);
                console.log("Výsledok runST:", result);

                window.globalInput = result.globalVariables;

                renderGlobals(window.globalInput);

                const outputDiv = document.getElementById("output");
                outputDiv.innerHTML = "<pre>" + JSON.stringify({
                locals: result.variables,
                globals: result.globalVariables
                }, null, 2) + "</pre>";

                console.log("Output aktualizovaný");
            }
            catch (e) 
            {
                console.error("Chyba počas simulácie:", e);
            }
        }, 500);

        const runBtn = document.getElementById("run");
        runBtn.classList.remove("btn-primary");
        runBtn.classList.add("btn-success");
    });

    //stop simulation tlacidlo
    document.getElementById("stop").addEventListener("click", () => 
    {
        clearInterval(loopId);
        loopId = null;

        window.editor.setOption("readOnly", false);

        const runBtn = document.getElementById("run");
        runBtn.classList.remove("btn-success");
        runBtn.classList.add("btn-primary");
    });
};
