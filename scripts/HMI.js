document.querySelectorAll('.toolbox button').forEach(btn => 
{
    btn.addEventListener('click', () => 
    {
        const type = btn.dataset.type;

        if (type === 'button') 
        {
            const newBtn = document.createElement('button');
            newBtn.textContent = 'Nové tlačidlo';
            newBtn.className = 'btn btn-primary hmi-element';
            newBtn.style.position = 'absolute';
            newBtn.style.top = '50px';
            newBtn.style.left = '50px';

            makeDraggable(newBtn);

            document.getElementById('hmi-canvas').appendChild(newBtn);
        }
    });
});

function makeDraggable(element) 
{
    element.onmousedown = function(event) 
    {
        event.preventDefault();

        let shiftX = event.clientX - element.getBoundingClientRect().left;
        let shiftY = event.clientY - element.getBoundingClientRect().top;

        const parent = element.parentElement;
        const parentRect = parent.getBoundingClientRect();

        function moveAt(pageX, pageY) 
        {
            let newLeft = pageX - shiftX - parentRect.left;
            let newTop = pageY - shiftY - parentRect.top;

            // ohranič vnútri plátna
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + element.offsetWidth > parent.clientWidth) 
            {
                newLeft = parent.clientWidth - element.offsetWidth;
            }
            if (newTop + element.offsetHeight > parent.clientHeight) 
            {
                newTop = parent.clientHeight - element.offsetHeight;
            }

            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        }

        function onMouseMove(e) 
        {
            moveAt(e.pageX, e.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        element.onmouseup = function() 
        {
            document.removeEventListener('mousemove', onMouseMove);
            element.onmouseup = null;
        };
    };

    element.ondragstart = function() 
    {
        return false;
    };
}