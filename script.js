function createDraggableButton() {
    const input = document.getElementById('data-input');
    const text = input.value.trim();
    
    if (!text) {
        alert('请输入数据！');
        return;
    }

    const button = document.createElement('div');
    button.className = 'draggable-button';
    button.textContent = text;
    button.draggable = true;

    // 添加拖动事件监听器
    button.addEventListener('dragstart', handleDragStart);
    button.addEventListener('dragend', handleDragEnd);

    document.getElementById('button-container').appendChild(button);
    input.value = ''; // 清空输入框
}

function handleDragStart(e) {
    e.target.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.textContent);
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

// 为容器添加拖放事件监听器
const container = document.getElementById('button-container');
container.addEventListener('dragover', (e) => {
    e.preventDefault();
});

container.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggingElement = document.querySelector('.draggable-button[draggable="true"][style*="opacity: 0.4"]');
    
    if (draggingElement) {
        draggingElement.classList.remove('horizontal-button');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        draggingElement.style.position = 'absolute';
        draggingElement.style.left = x + 'px';
        draggingElement.style.top = y + 'px';
        
        container.appendChild(draggingElement);
    }
});

// 为横向容器添加拖放事件监听器
const horizontalContainer = document.getElementById('horizontal-container');
horizontalContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

horizontalContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggingElement = document.querySelector('.draggable-button[draggable="true"][style*="opacity: 0.4"]');
    
    // 找到最近的格子元素
    const cell = e.target.closest('.grid-cell');
    
    if (draggingElement && cell) {
        // 清空格子当前的内容
        cell.innerHTML = '';
        
        // 移除之前的定位样式
        draggingElement.style.position = '';
        draggingElement.style.left = '';
        draggingElement.style.top = '';
        draggingElement.classList.add('horizontal-button');
        
        // 将按钮添加到格子中
        cell.appendChild(draggingElement);
        cell.classList.add('filled');
        
        // 调整按钮样式以适应格子
        draggingElement.style.margin = '0';
        draggingElement.style.width = '100%';
        draggingElement.style.height = '100%';
        draggingElement.style.display = 'flex';
        draggingElement.style.alignItems = 'center';
        draggingElement.style.justifyContent = 'center';

        // 检查是否需要添加新的格子
        const grid = document.querySelector('.coding-grid');
        const lastCell = grid.lastElementChild;
        
        if (lastCell === cell) {
            // 添加加号
            const plusSign = document.createElement('div');
            plusSign.className = 'plus-sign';
            plusSign.textContent = '+';
            grid.appendChild(plusSign);
            
            // 添加新格子
            const newCell = document.createElement('div');
            newCell.className = 'grid-cell';
            newCell.dataset.cell = grid.querySelectorAll('.grid-cell').length + 1;
            grid.appendChild(newCell);
            
            // 为新格子添加拖放事件监听器
            addCellEventListeners(newCell);
        }
    }
});

// 提取格子事件监听器添加函数
function addCellEventListeners(cell) {
    cell.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    cell.addEventListener('dragstart', (e) => {
        const button = e.target.closest('.draggable-button');
        if (button) {
            button.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', button.textContent);
            cell.classList.remove('filled');
        }
    });
}

// 修改重置按钮功能
document.getElementById('reset-grid').addEventListener('click', function() {
    const grid = document.querySelector('.coding-grid');
    const cells = grid.querySelectorAll('.grid-cell');
    
    cells.forEach(cell => {
        if (cell.children.length > 0) {
            const button = cell.children[0];
            
            // 恢复按钮的原始样式
            button.style.position = 'absolute';
            button.style.width = '';
            button.style.height = '';
            button.style.margin = '5px';
            button.style.display = 'inline-block';
            button.classList.remove('horizontal-button');
            
            // 将按钮移回自由拖动区域
            const container = document.getElementById('button-container');
            container.appendChild(button);
            
            // 随机位置
            const rect = container.getBoundingClientRect();
            const x = Math.random() * (rect.width - 100);
            const y = Math.random() * (rect.height - 50);
            
            button.style.left = x + 'px';
            button.style.top = y + 'px';
        }
        
        cell.classList.remove('filled');
    });

    // 重置格子区域为初始状态
    grid.innerHTML = '<div class="grid-cell" data-cell="1"></div>';
    
    // 重新为初始格子添加事件监听器
    addCellEventListeners(grid.firstElementChild);
});

// 修改提交按钮的功能
document.getElementById('submit-button').addEventListener('click', async function() {
    try {
        // 使用 html2canvas 截图
        const container = document.getElementById('horizontal-container');
        const canvas = await html2canvas(container);
        const imageData = canvas.toDataURL('image/png');
        
        // 保存到 localStorage
        const groupNumber = new URLSearchParams(window.location.search).get('group');
        localStorage.setItem(`group${groupNumber}_submitted`, 'true');
        localStorage.setItem(`group${groupNumber}_image`, imageData);

        // 显示提交成功提示
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.textContent = '提交成功！';
        document.body.appendChild(overlay);

        // 3秒后自动跳转回小组选择页面
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } catch (error) {
        console.error('截图失败:', error);
        alert('提交失败，请重试！');
    }
});

// 初始化 Supabase
const supabase = createClient('你的URL', '你的KEY')

// 保存数据
async function saveSubmission(groupNumber, imageData) {
    await supabase
        .from('submissions')
        .upsert([
            { group_number: groupNumber, image_data: imageData }
        ])
}

// 获取数据
async function loadSubmissions() {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
    return data
} 