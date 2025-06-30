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
            addResizer(newBtn);

            newBtn.addEventListener('click', function(e) 
            {
                e.stopPropagation();
                selectElement(newBtn);
            });

            document.getElementById('hmi-canvas').appendChild(newBtn);
        }
    });
});

function makeDraggable(element) 
{
    element.onmousedown = function(event) 
    {
        if (event.target.classList.contains('resizer')) return;

        event.preventDefault();

        let shiftX = event.clientX - element.getBoundingClientRect().left;
        let shiftY = event.clientY - element.getBoundingClientRect().top;

        const parent = element.parentElement;
        const parentRect = parent.getBoundingClientRect();

        function moveAt(pageX, pageY) 
        {
            let newLeft = pageX - shiftX - parentRect.left;
            let newTop = pageY - shiftY - parentRect.top;

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

function addResizer(element) 
{
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', function(e) 
    {
        e.stopPropagation();
        e.preventDefault();

        const parent = element.parentElement;
        const parentRect = parent.getBoundingClientRect();

        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        let startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

        function doDrag(e) 
        {
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);

            if (newWidth < 30) newWidth = 30;
            if (newHeight < 20) newHeight = 20;

            if (element.offsetLeft + newWidth > parent.clientWidth) 
            {
                newWidth = parent.clientWidth - element.offsetLeft;
            }
            if (element.offsetTop + newHeight > parent.clientHeight) 
            {
                newHeight = parent.clientHeight - element.offsetTop;
            }

            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }

        function stopDrag() 
        {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    });
}

let selectedElement = null;

function selectElement(el) 
{
    if (selectedElement) 
    {
        selectedElement.classList.remove('selected');
    }

    selectedElement = el;
    selectedElement.classList.add('selected');

    document.getElementById('properties-panel').style.display = 'block';
    document.getElementById('prop-text').value = el.innerText;
}

document.getElementById('prop-text').addEventListener('input', function(e) 
{
    if (selectedElement) 
    {
        selectedElement.innerText = e.target.value;
    }
});

document.getElementById('hmi-canvas').addEventListener('click', () => 
{
    if (selectedElement) 
    {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }

    document.getElementById('properties-panel').style.display = 'none';
});