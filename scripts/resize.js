document.querySelectorAll('[data-resize]').forEach(resizer => {
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
         isResizing = true;
        document.body.style.cursor = resizer.dataset.resize === 'x' ? 'col-resize' : 'row-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const target = resizer.previousElementSibling;
        const direction = resizer.dataset.resize;

        if (direction === 'y') 
        {
            const containerTop = target.parentElement.getBoundingClientRect().top;
            const newHeight = e.clientY - containerTop;
            target.style.height = `${newHeight}px`;
            target.style.flex = 'none';
        }

        if (direction === 'x') 
        {
            const containerLeft = target.parentElement.getBoundingClientRect().left;
            const newWidth = e.clientX - containerLeft;
            target.style.width = `${newWidth}px`;
            target.style.flex = 'none';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
    
});