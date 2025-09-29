        // 全局变量
        let currentPage = 'home'; // 当前页面


        // 页面切换功能
        function showPage(pageId) {
            // 隐藏所有页面并显示目标页面
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(pageId + '-page');
            if (targetPage) targetPage.classList.add('active');

            // 更新底部导航栏状态
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            const targetNavItem = Array.from(document.querySelectorAll('.nav-item')).find(item =>
                item.getAttribute('onclick').includes(pageId)
            );
            if (targetNavItem) targetNavItem.classList.add('active');

            // 更新顶部导航栏状态
            document.querySelectorAll('.top-nav-item').forEach(item => item.classList.remove('active'));
            const targetTopNavItem = Array.from(document.querySelectorAll('.top-nav-item')).find(item =>
                item.getAttribute('onclick').includes(pageId)
            );
            if (targetTopNavItem) targetTopNavItem.classList.add('active');

            currentPage = pageId;

            // 如果离开工具页面，收缩所有工具
            if (pageId !== 'tools') {
                collapseAllTools();
            }

            // 如果进入逛页面，初始化商城
            if (pageId === 'browse') {
                initBrowsePage();
            }

            // 页面特定初始化
            if (pageId === 'home') {
                // 首页：总是刷新广告活动公告
                fetchAnnouncements();
                fetchAds();
                fetchTodayActivities();
                updateDate();
            } else if (pageId === 'guide') {
                // 初始化清空按钮状态
                setTimeout(toggleClearButton, 100);
                // 显示或隐藏上传攻略按钮
                updateUploadGuideButton();
                // 显示奖励信息
                updateGuideRewardInfo();
                // 加载随机30条攻略内容
                loadRandomGuides();
            } else if (pageId === 'tools') {
                // 工具页面初始化
                initToolsPage();
            } else if (pageId === 'profile') {
                // 个人中心页面初始化
                checkUnreadMessages();
                loadNoticeBadge();
                // 重新获取用户信息
                if (userToken) {
                    checkLoginStatus();
                }
            } else if (pageId === 'browse') {
                // 逛页面初始化
                initBrowsePage();
            }
        }

        // 工具页面初始化
        function initToolsPage() {
            // 可以在这里添加工具页面的初始化逻辑
        }

        // 收缩所有工具
        function collapseAllTools() {
            // 获取所有工具内容区域
            const toolContents = document.querySelectorAll('[id$="-content"]');
            const toolToggles = document.querySelectorAll('[id$="-toggle"]');

            toolContents.forEach(content => {
                if (content.id.includes('tool') || content.id.includes('calc')) {
                    content.style.display = 'none';
                }
            });

            toolToggles.forEach(toggle => {
                if (toggle.id.includes('tool') || toggle.id.includes('calc')) {
                    toggle.classList.remove('expanded');
                }
            });
        }

        // 工具展开/收起功能
        function toggleTool(toolId) {
            const content = document.getElementById(toolId + '-content');
            const toggle = document.getElementById(toolId + '-toggle');

            if (content && toggle) {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    toggle.classList.add('expanded');
                } else {
                    content.style.display = 'none';
                    toggle.classList.remove('expanded');
                }
            }
        }

        // 页面加载时初始化
        window.onload = function() {
            fetchAnnouncements();
            fetchAds();
            fetchTodayActivities();
            updateDate();
            // 初始化清空按钮状态
            setTimeout(toggleClearButton, 100);
            // 初始化虚拟键盘处理
            initVirtualKeyboardHandler();
            // 初始化导航栏显示
            initNavigationDisplay();
            // 初始化妖火代练日志查询
            initTrainingLogQuery();
            // 初始化吹牛大王功能
            initBragKing();
        };

        // 初始化妖火代练日志查询
        function initTrainingLogQuery() {
            // 初始化日期选项
            populateTrainingDateOptions();

            // 添加账号输入框事件监听
            const accountInput = document.getElementById('trainingAccount');
            if (accountInput) {
                accountInput.addEventListener('focus', showSavedTrainingAccounts);

                // 添加回车键查询功能
                accountInput.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        queryTrainingLogs();
                    }
                });

                // 点击其他地方隐藏账号列表
                document.addEventListener('click', function(event) {
                    const accountList = document.getElementById('trainingAccountList');
                    const autocompleteContainer = accountInput.closest('.autocomplete-container');
                    if (!autocompleteContainer.contains(event.target) && accountList) {
                        accountList.style.display = 'none';
                    }
                });
            }
        }

        // 初始化导航栏显示
        function initNavigationDisplay() {
            const topNav = document.querySelector('.top-nav');
            const isDesktop = window.innerWidth > 768;

            if (isDesktop && topNav) {
                // 延迟显示顶部导航栏，创建平滑的进入动画
                setTimeout(() => {
                    topNav.classList.add('show');
                }, 100);
            }

            // 监听窗口大小变化
            window.addEventListener('resize', function() {
                const newIsDesktop = window.innerWidth > 768;
                if (newIsDesktop !== isDesktop) {
                    location.reload(); // 简单的方式：重新加载页面以应用正确的样式
                }
            });
        }

        // 处理虚拟键盘的函数
        function initVirtualKeyboardHandler() {
            // 检测是否为移动设备
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;

            let initialViewportHeight = window.innerHeight;

            // 监听视口高度变化
            function handleViewportChange() {
                const currentHeight = window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;

                // 如果高度减少超过150px，认为是虚拟键盘出现
                if (heightDifference > 150) {
                    // 虚拟键盘出现，确保导航栏固定在底部
                    const bottomNav = document.querySelector('.bottom-nav');
                    if (bottomNav) {
                        bottomNav.style.position = 'fixed';
                        bottomNav.style.bottom = '0';
                        bottomNav.style.transform = 'translateZ(0)';
                    }
                } else {
                    // 虚拟键盘隐藏，恢复正常状态
                    const bottomNav = document.querySelector('.bottom-nav');
                    if (bottomNav) {
                        bottomNav.style.position = 'fixed';
                        bottomNav.style.bottom = '0';
                    }
                }
            }

            // 监听窗口大小变化
            window.addEventListener('resize', handleViewportChange);

            // 监听视觉视口变化（更准确的虚拟键盘检测）
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', handleViewportChange);
            }
        }

        // 更新日期
        function updateDate() {
            const now = new Date();
            // 转换为北京时间 (UTC+8)
            const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
            
            const year = beijingTime.getUTCFullYear();
            const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
            const day = String(beijingTime.getUTCDate()).padStart(2, '0');
            
            document.getElementById('currentDate').textContent = `${year}-${month}-${day}`;
        }

        // 获取公告的函数
        function fetchAnnouncements() {
            const announcementsDiv = document.getElementById('announcements');
            const refreshBtn = document.querySelector('.refresh-btn');

            // 添加旋转动画到刷新按钮
            const originalHtml = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 刷新中';
            refreshBtn.style.pointerEvents = 'none';

            announcementsDiv.innerHTML = '<div class="loader"></div>';

            fetch('/announcements')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('网络响应不正常');
                    }
                    return response.text();
                })
                .then(data => {
                    displayAnnouncements(data);
                    // 恢复刷新按钮
                    refreshBtn.innerHTML = originalHtml;
                    refreshBtn.style.pointerEvents = 'auto';
                })
                .catch(error => {
                    console.error('获取公告失败:', error);
                    announcementsDiv.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i> 获取公告失败，请稍后重试
                        </div>
                    `;
                    // 恢复刷新按钮
                    refreshBtn.innerHTML = originalHtml;
                    refreshBtn.style.pointerEvents = 'auto';
                });
        }

        // 显示公告的函数
        function displayAnnouncements(data) {
            const announcementsDiv = document.getElementById('announcements');

            if (data.includes("暂无公告")) {
                announcementsDiv.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-info-circle"></i> 暂无公告
                    </div>
                `;
                return;
            }

            // 按行分割数据
            const lines = data.split('\n');
            
            // 处理公告内容
            const announcements = [];
            let currentAnnouncement = {};
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                if (line.startsWith('时间：')) {
                    currentAnnouncement.time = line.replace('时间：', '');
                } else if (line.startsWith('链接：')) {
                    currentAnnouncement.link = line.replace('链接：', '');
                    announcements.push(currentAnnouncement);
                    currentAnnouncement = {};
                } else {
                    currentAnnouncement.title = line;
                }
            }
            
            // 生成HTML
            let html = '';
            if (announcements.length === 0) {
                html = '<div class="error-message">暂无公告</div>';
            } else {
                announcements.forEach(ann => {
                    html += `
                        <div class="announcement">
                            <div class="announcement-content">
                                <p class="announcement-title" onclick="window.open('${ann.link}', '_blank')" title="${ann.title}">
                                    ${ann.title}
                                </p>
                                <span class="announcement-time">${ann.time}</span>
                            </div>
                        </div>
                    `;
                });
            }
            
            announcementsDiv.innerHTML = html;
        }

        // 获取广告的函数
        function fetchAds() {
            const adsDiv = document.getElementById('ads');
            const adRefreshBtn = document.querySelector('.ad-refresh');

            // 添加旋转动画到刷新按钮
            adRefreshBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            adRefreshBtn.style.pointerEvents = 'none';

            adsDiv.innerHTML = '<div class="loader"></div>';

            fetch('/ads')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('获取广告失败');
                    }
                    return response.json();
                })
                .then(ads => {
                    displayAds(ads);
                    // 恢复刷新按钮
                    adRefreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    adRefreshBtn.style.pointerEvents = 'auto';
                })
                .catch(error => {
                    console.error('获取广告失败:', error);
                    adsDiv.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i> 广告加载失败
                        </div>
                    `;
                    // 恢复刷新按钮
                    adRefreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    adRefreshBtn.style.pointerEvents = 'auto';
                });
        }

        // 广告点击处理函数
        async function handleAdClick(adId, adUrl, adTitle) {
            try {
                // 先记录点击统计
                await fetch('/api/ads/click', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ adId: adId })
                });
            } catch (error) {
                console.error('广告点击统计失败:', error);
            }

            // 然后打开链接
            window.open(adUrl, '_blank');
        }

        // 显示广告的函数
        function displayAds(ads) {
            const adsDiv = document.getElementById('ads');

            if (!ads || ads.length === 0) {
                adsDiv.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-info-circle"></i> 暂无广告
                    </div>
                `;
                return;
            }

            let html = '';
            ads.forEach(ad => {
                html += `
                    <div class="announcement">
                        <div class="announcement-content">
                            <p class="announcement-title" onclick="handleAdClick(${ad.id}, '${ad.url}', '${ad.title}')" title="${ad.title}" style="cursor: pointer;">
                                ${ad.title}
                            </p>
                        </div>
                    </div>
                `;
            });

            adsDiv.innerHTML = html;
        }

        // 获取今日活动的函数
        function fetchTodayActivities() {
            const activitiesDiv = document.getElementById('todayActivities');
            const activityRefreshBtn = document.querySelector('#activity-card .ad-refresh');

            // 添加旋转动画到刷新按钮
            activityRefreshBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            activityRefreshBtn.style.pointerEvents = 'none';

            activitiesDiv.innerHTML = '<div class="loader"></div>';

            fetch('/todayActivities')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('获取今日活动失败');
                    }
                    return response.json();
                })
                .then(data => {
                    displayTodayActivities(data);
                    // 恢复刷新按钮
                    activityRefreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    activityRefreshBtn.style.pointerEvents = 'auto';
                })
                .catch(error => {
                    console.error('获取今日活动失败:', error);
                    activitiesDiv.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i> 活动加载失败
                        </div>
                    `;
                    // 恢复刷新按钮
                    activityRefreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    activityRefreshBtn.style.pointerEvents = 'auto';
                });
        }

        // 显示今日活动的函数
        function displayTodayActivities(data) {
            const activitiesDiv = document.getElementById('todayActivities');
            const activityTitle = document.getElementById('activityTitle');

            // 更新标题
            activityTitle.textContent = `今日活动(${data.weekday})`;

            if (!data.activities || data.activities.length === 0) {
                activitiesDiv.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-info-circle"></i> 今日暂无活动
                    </div>
                `;
                return;
            }

            let html = '';
            data.activities.forEach(activity => {
                html += `
                    <div class="announcement">
                        <div class="announcement-content">
                            <p class="announcement-title" onclick="window.open('${activity.url}', '_blank')" title="活动名：${activity.name}">
                                活动：${activity.name}
                            </p>
                            <div class="announcement-time">
                                时间：${activity.time}
                            </div>
                        </div>
                    </div>
                `;
            });

            activitiesDiv.innerHTML = html;
        }



        // 妖火代练日志查询功能

        function populateTrainingDateOptions() {
            const dateSelect = document.getElementById('trainingDate');
            if (!dateSelect) return;

            dateSelect.innerHTML = '';
            const today = new Date();

            // 将当前时间设置为中国时区
            const beijingTime = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));

            for (let i = 0; i < 3; i++) {
                const tempDate = new Date(beijingTime);
                tempDate.setDate(beijingTime.getDate() - i);
                const yyyy = tempDate.getFullYear();
                const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
                const dd = String(tempDate.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}${mm}${dd}`;

                const option = document.createElement('option');
                option.value = formattedDate;
                option.textContent = formattedDate;
                dateSelect.appendChild(option);
            }

            dateSelect.value = beijingTime.toISOString().slice(0, 10).replace(/-/g, '');
        }

        function stringToHex(str) {
            let hex = '';
            for (let i = 0; i < str.length; i++) {
                hex += str.charCodeAt(i).toString(16).padStart(2, '0');
            }
            return hex.toUpperCase();
        }

        function getTrainingTypeCode(type) {
            const typeCodes = {
                '除妖': 'CHUYAO',
                '心魔': 'XINMO',
                '王者': 'WANGZHE',
                '限时': 'XIANSHI',
                '神玉': 'SHENYU'
            };
            return typeCodes[type] || '';
        }

        function saveTrainingAccount(account) {
            const accounts = getSavedTrainingAccounts();
            if (!accounts.includes(account)) {
                accounts.push(account);
                localStorage.setItem('trainingAccounts', JSON.stringify(accounts));
            }
        }

        function getSavedTrainingAccounts() {
            const saved = localStorage.getItem('trainingAccounts');
            return saved ? JSON.parse(saved) : [];
        }

        function showSavedTrainingAccounts() {
            const accountList = document.getElementById('trainingAccountList');
            if (!accountList) return;

            accountList.innerHTML = '';
            const accounts = getSavedTrainingAccounts();

            if (accounts.length > 0) {
                accountList.style.display = 'block';

                accounts.forEach(account => {
                    const li = document.createElement('li');
                    li.textContent = account;

                    const span = document.createElement('span');
                    span.textContent = '✖';
                    span.onclick = (event) => {
                        event.stopPropagation();
                        deleteTrainingAccount(account);
                        li.remove();
                    };
                    li.appendChild(span);

                    li.onclick = () => {
                        document.getElementById('trainingAccount').value = account;
                        accountList.style.display = 'none';
                    };
                    accountList.appendChild(li);
                });
            } else {
                accountList.style.display = 'none';
            }
        }

        function deleteTrainingAccount(account) {
            const accounts = getSavedTrainingAccounts().filter(acc => acc !== account);
            localStorage.setItem('trainingAccounts', JSON.stringify(accounts));
            showSavedTrainingAccounts();

            // 如果没有账号了，隐藏列表
            if (accounts.length === 0) {
                const accountList = document.getElementById('trainingAccountList');
                if (accountList) {
                    accountList.style.display = 'none';
                }
            }
        }

        async function queryTrainingLogs() {
            const account = document.getElementById('trainingAccount').value.trim();
            const type = document.getElementById('trainingType').value;
            const selectedDate = document.getElementById('trainingDate').value;

            if (!account) {
                alert('请输入游戏账号');
                return;
            }

            const formattedDate = selectedDate;
            const fixedValue1 = 'TSYH';
            const hexAccount = stringToHex(account);
            const fixedValue2 = 'TSTJ';
            const typeCode = getTrainingTypeCode(type);
            const content1 = `${formattedDate}${fixedValue1}${hexAccount}${fixedValue2}${typeCode}`;

            const queryButton = document.getElementById('trainingQueryButton');
            const resultDiv = document.getElementById('trainingLogResult');
            const resultContainer = document.getElementById('trainingResult');

            queryButton.innerText = '查询中...';
            queryButton.disabled = true;
            resultContainer.style.display = 'block';
            resultDiv.innerHTML = '查询中...';

            try {
                const response = await fetch('/api/training-log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({ '1': content1 }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.text();
                const resultText = data.trim();

                if (resultText === '' || resultText === '暂无日志记录') {
                    resultDiv.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">暂无日志记录</div>';
                } else {
                    resultDiv.innerHTML = resultText;
                }

                // 只有在成功查询后才保存账号
                saveTrainingAccount(account);
            } catch (error) {
                console.error('代练日志查询错误:', error);
                resultDiv.innerHTML = `<div style="text-align: center; color: #e74c3c; padding: 20px;">查询失败: ${error.message}</div>`;
            } finally {
                queryButton.innerText = '查询';
                queryButton.disabled = false;
            }
        }

        function clearTrainingLog() {
            document.getElementById('trainingAccount').value = '';
            document.getElementById('trainingType').selectedIndex = 0;
            populateTrainingDateOptions();
            const resultContainer = document.getElementById('trainingResult');
            resultContainer.style.display = 'none';

            // 隐藏账号列表
            const accountList = document.getElementById('trainingAccountList');
            if (accountList) {
                accountList.style.display = 'none';
            }
        }

        // 工具页面的骗子查询功能
        function checkCheatInTool() {
            const qqInput = document.getElementById('toolQqInput');
            const cheatResult = document.getElementById('toolCheatResult');
            const qq = qqInput.value.trim();

            if (!qq) {
                cheatResult.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i> 请输入QQ号码
                    </div>
                `;
                return;
            }

            cheatResult.innerHTML = '<div class="loader"></div>';

            fetch(`/checkCheat?qq=${qq}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('查询失败');
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.isCheat) {
                        cheatResult.innerHTML = `
                            <div class="cheat-result cheat-found">
                                <i class="fas fa-exclamation-triangle"></i> 请注意，${qq}为骗子！
                                <a href="${result.url}" target="_blank">点击查看详情</a>
                            </div>
                        `;
                    } else {
                        cheatResult.innerHTML = `
                            <div class="cheat-result cheat-not-found">
                                <i class="fas fa-check-circle"></i> ${qq}不在骗子列表，请注意自行辨别！
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error('查询失败:', error);
                    cheatResult.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i> 查询失败，请稍后重试
                        </div>
                    `;
                });
        }

        // 表情包生成功能
        async function generateMeme() {
            const qq1Input = document.getElementById('qq1Input');
            const qq2Input = document.getElementById('qq2Input');
            const memeTypeSelect = document.getElementById('memeType');
            const memeResult = document.getElementById('memeResult');
            const generateBtn = document.getElementById('generateMemeBtn');

            const qq1 = qq1Input.value.trim();
            const qq2 = qq2Input.value.trim();
            const memeType = memeTypeSelect.value;

            // 验证输入
            if (!qq1 || !qq2) {
                memeResult.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center;">请输入两个QQ号</div>
                `;
                memeResult.style.display = 'block';
                return;
            }

            // 验证QQ号格式
            if (!/^\d+$/.test(qq1) || !/^\d+$/.test(qq2)) {
                memeResult.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center;">QQ号格式不正确，请输入纯数字</div>
                `;
                memeResult.style.display = 'block';
                return;
            }

            // 显示加载状态
            memeResult.innerHTML = `
                <div class="pet-result-title">生成中...</div>
                <div class="loader"></div>
                <div style="text-align: center; margin-top: 10px;">正在生成表情包，请稍候...</div>
            `;
            memeResult.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';

            try {
                const response = await fetch('/generate-meme-by-type', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        qq1: qq1,
                        qq2: qq2,
                        memeType: memeType
                    })
                });

                const data = await response.json();

                if (data.code === 200) {
                    memeResult.innerHTML = `
                        <div class="pet-result-title">生成成功！</div>
                        <div style="text-align: center; margin-top: 15px;">
                            <img src="${data.data}" alt="拥抱表情包" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        </div>
                    `;
                } else {
                    throw new Error(data.msg || '生成失败');
                }
            } catch (error) {
                console.error('表情包生成错误:', error);
                memeResult.innerHTML = `
                    <div class="pet-result-title">生成失败</div>
                    <div style="color: #e74c3c; text-align: center;">
                        ${error.message || '网络错误，请稍后重试'}
                    </div>
                `;
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成表情包';
            }
        }

        // 清空表情包表单
        function clearMemeForm() {
            document.getElementById('qq1Input').value = '';
            document.getElementById('qq2Input').value = '';
            document.getElementById('memeType').selectedIndex = 0;
            document.getElementById('memeResult').style.display = 'none';
        }

        // 宠物资质进化计算功能
        function calculatePetEvolution() {
            const currentQualityValue = document.getElementById('currentQuality').value;
            const targetQualityValue = document.getElementById('targetQuality').value;
            const qualityType = document.getElementById('qualityType').value;
            const resultDiv = document.getElementById('petResult');

            // 检查是否为空
            if (currentQualityValue === '' || targetQualityValue === '') {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center;">请输入当前资质和目标资质</div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            const currentQuality = parseInt(currentQualityValue);
            const targetQuality = parseInt(targetQualityValue);

            // 验证输入
            if (isNaN(currentQuality) || isNaN(targetQuality) || currentQuality < 0 || targetQuality < 0) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center;">请输入有效的当前资质和目标资质（不能小于0）</div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            if (currentQuality >= targetQuality) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center;">目标资质必须大于当前资质</div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            if (currentQuality < 225 && targetQuality < 1000) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">计算结果</div>
                    <div style="color: #e74c3c; text-align: center;">进化不满</div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            // 进化计算
            let a = currentQuality;
            let b = targetQuality;
            let x1 = 0;
            let resultHTML = '<div class="pet-result-title">进化过程：（需进化x次）</div>';

            while (a < b && x1 < 55) {
                x1++;
                resultHTML += `<div class="evolution-step">`;
                resultHTML += `<strong>第${x1}次进化：</strong><br>`;

                const c = Math.floor(0.05 * a);

                if (a + c > b) {
                    resultHTML += `本次进化最大涨幅资质点: ${b - a}<br>`;
                    resultHTML += `满资质进化,辅助宠物所需最低资质: ${a + (b - a) * 4}<br>`;
                    resultHTML += `进化后资质: ${b}<br>`;
                    a = b;
                } else {
                    resultHTML += `本次进化最大涨幅资质点: ${c}<br>`;
                    resultHTML += `满资质进化,辅助宠物所需最低资质: ${Math.floor(a * 1.2)}<br>`;
                    resultHTML += `进化后资质: ${a + c}<br>`;
                    a += c;
                }

                resultHTML += `</div>`;

                if (a >= b) break;
            }

            if (x1 >= 55) {
                resultHTML = '<div class="pet-result-title">计算结果</div><div style="color: #e74c3c; text-align: center;">进化不满,别进化了.</div>';
            } else {
                // 更新标题显示实际进化次数
                resultHTML = resultHTML.replace('（需进化x次）', `（需进化${x1}次）`);
                resultHTML += `<div class="pet-summary">累计进化: ${x1}次</div>`;

                // 添加宠物推荐
                if (qualityType) {
                    const recommendationData = getPetRecommendations(qualityType);
                    if (recommendationData) {
                        resultHTML += `<div class="pet-recommendations">
                            ${formatPetRecommendations(recommendationData)}
                        </div>`;
                    }
                }
            }

            resultDiv.innerHTML = resultHTML;
            resultDiv.style.display = 'block';
        }

        // 获取宠物推荐
        function getPetRecommendations(qualityType) {
            const recommendations = {
                '强壮': {
                    title: '强壮资质宠物推荐',
                    pets: [
                        { name: '巨蝎', quality: 8130, location: '锁魂卡捕捉', description: '高强壮资质，适合物理攻击型宠物' },
                        { name: '白虎/雪狼', quality: 8000, location: '千针雪林捕捉', description: '优秀的强壮资质，容易获得' },
                        { name: '冰雪暴熊', quality: 8200, location: '咆哮谷捕捉', description: '强壮资质较高，推荐进化使用' },
                        { name: '石巨人', quality: 7800, location: '埋骨之地捕捉', description: '稳定的强壮资质来源' }
                    ]
                },
                '智力': {
                    title: '智力资质宠物推荐',
                    pets: [
                        { name: '玉玲珑', quality: 8300, location: '商人购买', description: '' },
                        { name: '青鸾', quality: 7800, location: '商人购买', description: '' },
                        { name: '朱雀', quality: 7000, location: '商人购买', description: '' },
                        { name: '精灵鼠/小狐仙', quality: 6500, location: '商人购买/周年庆烟花', description: '' },
                        { name: '蚌精', quality: 5600, location: '遗忘废墟 幌金绳', description: '' },
                        { name: '赤脚医者', quality: 6100, location: '宠物岛二层捕提', description: '' },
                        { name: '红翼蝶女', quality: 4800, location: '密霞谷 混天绫', description: '' }
                    ]
                },
                '耐力': {
                    title: '耐力资质宠物推荐',
                    pets: [
                        { name: '冰雪巨人', quality: 9200, location: '咆哮谷 乾坤袋', description: '' },
                        { name: '炖炖', quality: 7500, location: '白银VIP副本捕捉', description: '' },
                        { name: '青牛头领', quality: 6800, location: '锁魂卡捕捉', description: '' }
                    ]
                },
                '信仰': {
                    title: '信仰资质宠物推荐',
                    pets: [
                        { name: '石人', quality: 8300, location: '埋骨之地 乾坤袋', description: '' },
                        { name: '云鹤', quality: 6900, location: '商人购买', description: '' },
                        { name: '鹤仙人', quality: 6300, location: '商人购买', description: '' }
                    ]
                },
                '敏捷': {
                    title: '敏捷资质宠物推荐',
                    pets: [
                        { name: '大乌鸦头领', quality: 6800, location: '锁魂卡捕捉', description: '' },
                        { name: '魔蝎座/射手座', quality: 6200, location: '商人购买', description: '' }
                    ]
                }
            };

            return recommendations[qualityType] || null;
        }

        // 格式化宠物推荐显示
        function formatPetRecommendations(recommendationData) {
            if (!recommendationData) return '';

            let html = `<h4>${recommendationData.title}</h4>`;
            html += '<div class="pet-list">';

            recommendationData.pets.forEach((pet, index) => {
                html += `
                    <div class="pet-item ${index < 3 ? 'recommended' : 'alternative'}">
                        <div class="pet-name">${pet.name}</div>
                        <div class="pet-quality">资质: ${pet.quality}</div>
                        <div class="pet-location">获取: ${pet.location}</div>
                        <div class="pet-description">${pet.description}</div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        }

        // 清空宠物计算器
        function clearPetCalc() {
            document.getElementById('currentQuality').value = '';
            document.getElementById('targetQuality').value = '';
            document.getElementById('qualityType').value = '';
            document.getElementById('petResult').style.display = 'none';
        }

        // 等级经验查询数据
        const untransferredExpData = {
            0: 0, 1: 16, 2: 65, 3: 175, 4: 369, 5: 671, 6: 1105, 7: 1695, 8: 2465, 9: 3439,
            10: 4641, 11: 6095, 12: 7825, 13: 9855, 14: 12209, 15: 14911, 16: 17985, 17: 21455, 18: 25345, 19: 29679,
            20: 35408, 21: 43135, 22: 52408, 23: 63500, 24: 76723, 25: 92434, 26: 111040, 27: 133004, 28: 158847, 29: 189160,
            30: 224606, 31: 265930, 32: 313964, 33: 369638, 34: 433984, 35: 508151, 36: 593410, 37: 691165, 38: 802966, 39: 930516,
            40: 1075686, 41: 1240529, 42: 1427288, 43: 1638413, 44: 1876576, 45: 2144683, 46: 2445893, 47: 2783632, 48: 3161611, 49: 3583845,
            50: 4054669, 51: 4578759, 52: 5161154, 53: 5807271, 54: 6522935, 55: 7314393, 56: 8188346, 57: 9151965, 58: 10212923, 59: 11379416,
            60: 12550881, 61: 13696815, 62: 14910456, 63: 16193775, 64: 17548689, 65: 18977151, 66: 20481105, 67: 22062495, 68: 23723265, 69: 25465359,
            70: 27290721, 71: 29201295, 72: 31199025, 73: 33285855, 74: 35463729, 75: 37734591, 76: 40100385, 77: 42563055, 78: 45124545, 79: 47786799,
            80: 50551761, 81: 53421375, 82: 56397585, 83: 59482335, 84: 62677559, 85: 65985231, 86: 69407265, 87: 72945615, 88: 76602225, 89: 80379039,
            90: 84278001, 91: 88301055, 92: 92450145, 93: 96727215, 94: 101134209, 95: 105673071, 96: 133518352, 97: 152003512, 98: 171743437, 99: 192786562,
            100: 215182178
        };

        const firstExpData = {
            80: 80882800, 81: 85474200, 82: 90266100, 83: 95171700, 84: 100284100, 85: 105576400,
            86: 111051600, 87: 116713000, 88: 122563600, 89: 128606500, 90: 134844800, 91: 141281700,
            92: 147920200, 93: 154763500, 94: 161814700, 95: 169076900, 96: 213629400, 97: 243205600,
            98: 274789500, 99: 308458500, 100: 342127500, 101: 375796500, 102: 409465500, 103: 443134500,
            104: 481115100, 105: 524025600, 106: 567364100, 107: 612202700, 108: 658566600, 109: 708492900,
            110: 754010700, 111: 779151100, 112: 823945200, 113: 870424100, 114: 918618900, 115: 968560700,
            116: 1020280700, 117: 1073809700, 118: 1129179100, 119: 1186420000, 120: 1245563400, 121: 1306640400,
            122: 1369682200, 123: 1434719800, 124: 1501784300, 125: 1570906900, 126: 1642118600, 127: 1715450600,
            128: 1790934000, 129: 1868599800, 130: 1948479200, 131: 2030603300, 132: 2115003100, 133: 2201709800,
            134: 2201709800, 135: 2290754500, 136: 3282168300, 137: 4875982300, 138: 7072227600, 139: 9870935300
        };

        const secondExpData = {
            102: 601274398, 103: 655144798, 104: 709015198, 105: 769784176, 106: 838440985, 107: 907782528,
            108: 979521152, 109: 1053706624, 110: 1133588710, 111: 1206417177, 112: 1246641792, 113: 1318312320,
            114: 1392678528, 115: 1469790182, 116: 1549697049, 117: 1632448896, 118: 1718095488, 119: 1806686592,
            120: 1898271974, 121: 1992901401, 122: 2090624640, 123: 2191491456, 124: 2295551616, 125: 2402854886,
            126: 2513451033, 127: 2627389824, 128: 2744721024, 129: 2865494400, 130: 2989759718, 131: 3117566745,
            132: 3248965248, 133: 3384004992, 134: 3522735744, 135: 3665207270, 136: 4595035670, 137: 6338777016,
            138: 8486673120, 139: 10858028808, 140: 13404857828, 141: 13941052141, 142: 14498694226, 143: 15078641995,
            144: 15681787674, 145: 16309059180, 146: 17613783914, 147: 19022886627, 148: 20544717557, 149: 22188294961,
            150: 23963358557, 151: 26838961583, 152: 30059636972, 153: 33666793408, 154: 37706808616, 155: 42231624649,
            156: 47299420726, 157: 52975351213, 158: 59332393358, 159: 66452280560, 160: 74426554227, 161: 83357740734,
            162: 104197175917, 163: 130246469896, 164: 162808087371, 165: 203510109213, 166: 254387636517,
            167: 317984545646, 168: 397680682058, 169: 496850852572, 170: 621063565716
        };

        const thirdExpData = {
            31: 1149984, 32: 1361560, 33: 1607494, 34: 1892546, 35: 2221996, 36: 2601734, 37: 3038258,
            38: 3538764, 39: 4111184, 40: 4764242, 41: 5507512, 42: 6351506, 43: 7307714, 44: 8388674,
            45: 9608066, 46: 10980776, 47: 12522972, 48: 14252194, 49: 16187448, 50: 18349286, 51: 20759904,
            52: 23443244, 53: 26425110, 54: 29733224, 55: 33397426, 56: 37449692, 57: 41924332, 58: 46858060,
            59: 52290166, 60: 58262608, 61: 64260632, 62: 70127692, 63: 76341580, 64: 82912128, 65: 89849288,
            66: 97163010, 67: 104863256, 68: 112959974, 69: 121463116, 70: 130382640, 71: 139728488, 72: 149510630,
            73: 159739008, 74: 170423576, 75: 181574294, 76: 193201104, 77: 205313970, 78: 217922840, 79: 231037670,
            80: 244668412, 81: 258825014, 82: 273517440, 83: 288755634, 84: 304549554, 85: 320909154, 86: 337844380,
            87: 355365196, 88: 373481548, 89: 392203392, 90: 411540680, 91: 431503362, 92: 452101400, 93: 473344742,
            94: 495243340, 95: 517807152, 96: 541046120, 97: 683613960, 98: 778257984, 99: 879326396, 100: 987067196,
            101: 1094807996, 102: 1202548796, 103: 1310289596, 104: 1418030396, 105: 1539568352, 106: 1676881970,
            107: 1815565056, 108: 1959042304, 109: 2107413248, 110: 2267177420, 111: 2412834354, 112: 2493283584,
            113: 2636624640, 114: 2785357056, 115: 2939580364, 116: 3099394098, 117: 3264897792, 118: 3436190976,
            119: 3613373184, 120: 3796543948, 121: 3985802802, 122: 4181249280, 123: 4382982912, 124: 4591103232,
            125: 4805709772, 126: 5026902066, 127: 5254779648, 128: 5489442048, 129: 5730988800, 130: 5979519436,
            131: 6235133490, 132: 6497930496, 133: 6768009984, 134: 7045471488, 135: 7330414540, 136: 9190071340,
            137: 32380952380, 138: 35619047619, 139: 38857142857, 140: 42095238095, 141: 45333333333, 142: 48571428571,
            143: 51809523809, 144: 55047619047, 145: 58285714285, 146: 61523809523, 147: 64761904761, 148: 68000000000,
            149: 71238095238, 150: 74476190476, 151: 77714285714, 152: 80952380952, 153: 84190476190, 154: 87428571428,
            155: 90666666666, 156: 93904761904, 157: 97142857142, 158: 100380952380, 159: 103619047619, 160: 106857142847,
            161: 110095238095, 162: 113333333333, 163: 116571428571, 164: 119809523809, 165: 123047619047, 166: 126284714285,
            167: 129523809523, 168: 132761904761, 169: 136000000000, 170: 139238095238, 171: 142476190476, 172: 145714285714,
            173: 148952380952, 174: 152190476190, 175: 155428571428, 176: 158666666666, 177: 161904761904, 178: 165142847142,
            179: 168380952380, 180: 171619047619
        };

        const fourthExpData = {
            170: 190947619047, 171: 195095238095, 172: 199242857142, 173: 203390476190, 174: 207538095238,
            175: 211685714285, 176: 215833333333, 177: 219980952380, 178: 224128571428, 179: 228276190476,
            180: 238899999999, 181: 250049999999, 182: 261752499999, 183: 274035124999, 184: 286926881249,
            185: 300458225312, 186: 314661136578, 187: 329569193407, 188: 345217653077, 189: 361643535731,
            190: 378885712517, 191: 396984998143, 192: 415984248050, 193: 435928460453, 194: 456864883476,
            195: 478843127649, 196: 501915284032, 197: 526136048234, 198: 551562850645, 199: 578255993178,
            200: 606278792836
        };

        // 格式化数字显示
        function formatNumberWithUnits(num) {
            const units = ['', '万', '亿', '万亿'];
            const numStr = num.toString();
            const numLength = numStr.length;
            const groupCount = Math.ceil(numLength / 4);
            const groups = [];

            for (let i = 0; i < groupCount; i++) {
                const start = Math.max(0, numLength - (i + 1) * 4);
                const end = numLength - i * 4;
                const group = numStr.slice(start, end);
                groups.unshift(group);
            }

            let result = '';
            for (let i = 0; i < groups.length; i++) {
                if (groups[i] !== '0') {
                    result += groups[i] + units[groups.length - i - 1];
                }
            }

            return result;
        }

        // 等级经验查询计算
        function calculateExp() {
            const transferType = document.getElementById('transferType').value;
            const startLevel = parseInt(document.getElementById('startLevel').value);
            const endLevel = parseInt(document.getElementById('endLevel').value);
            const resultDiv = document.getElementById('levelExpResult');

            let expData;
            let minLevel;
            let maxLevel;

            if (transferType === 'untransferred') {
                expData = untransferredExpData;
                minLevel = 1;
                maxLevel = 100;
            } else if (transferType === 'first') {
                expData = firstExpData;
                minLevel = 80;
                maxLevel = 139;
            } else if (transferType === 'second') {
                expData = secondExpData;
                minLevel = 102;
                maxLevel = 170;
            } else if (transferType === 'third') {
                expData = thirdExpData;
                minLevel = 31;
                maxLevel = 180;
            } else {
                expData = fourthExpData;
                minLevel = 170;
                maxLevel = 200;
            }

            if (isNaN(startLevel) || isNaN(endLevel) || startLevel < minLevel || startLevel > maxLevel || endLevel < minLevel || endLevel > maxLevel) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center; padding: 20px;">
                        请输入 ${minLevel} 到 ${maxLevel} 之间的有效等级。
                    </div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            if (startLevel > endLevel) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center; padding: 20px;">
                        初始等级不能大于目标等级。
                    </div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            // 修正算法：计算从初始等级升到目标等级需要的经验
            // 数据中存储的是每个等级升级所需的经验值
            // 从1级升到2级，需要的是1级对应的经验值（16）
            let totalExp = 0;
            if (startLevel === endLevel) {
                totalExp = 0;
            } else {
                // 修正算法：从初始等级升到目标等级，需要累加从初始等级+1到目标等级的经验值
                // 例如：从135级升到136级，需要的是136级对应的经验值
                for (let level = startLevel + 1; level <= endLevel; level++) {
                    totalExp += expData[level];
                }
            }

            const formattedExp = formatNumberWithUnits(totalExp);
            resultDiv.innerHTML = `
                <div class="pet-result-title">经验查询结果</div>
                <div style="text-align: center; padding: 20px;">
                    <div style="color: #27ae60; font-size: 18px; margin-bottom: 10px;">
                        从等级 ${startLevel} 到等级 ${endLevel} 需要的经验值为:
                    </div>
                    <div style="color: #3498db; font-size: 24px; font-weight: bold;">
                        ${formattedExp}
                    </div>
                </div>
            `;
            resultDiv.style.display = 'block';
        }

        // 清空等级经验查询
        function clearLevelExp() {
            document.getElementById('transferType').value = 'untransferred';
            document.getElementById('startLevel').value = '';
            document.getElementById('endLevel').value = '';
            document.getElementById('levelExpResult').style.display = 'none';
        }

        // 羽毛进度查询功能
        async function searchFeather() {
            const featherType = document.getElementById('featherType').value;
            const keyword = document.getElementById('featherKeyword').value.trim();
            const resultDiv = document.getElementById('featherResult');

            // 100级羽毛直接显示全部内容，无需关键词
            if (featherType === '100') {
                await loadFeatherContent('100级羽毛.txt', '', resultDiv, featherType);
                return;
            }

            // 其他类型：如果没有关键词，显示所有内容；如果有关键词，进行搜索
            // 不再要求必须输入关键词

            // 根据选择的类型加载对应文件
            let fileName = '';
            switch (featherType) {
                case 'all':
                    fileName = '全部等级羽毛.txt';
                    break;
                case '100':
                    fileName = '100级羽毛.txt';
                    break;
                case '110':
                    fileName = '110级羽毛.txt';
                    break;
                case '120':
                    fileName = '120级羽毛.txt';
                    break;
                case '150':
                    fileName = '150级羽毛.txt';
                    break;
                case '150-follow':
                    fileName = '150羽毛任务后续.txt';
                    break;
                default:
                    showAlert('请选择羽毛类型', 'warning');
                    return;
            }

            await loadFeatherContent(fileName, keyword, resultDiv, featherType);
        }

        // 加载羽毛攻略内容
        async function loadFeatherContent(fileName, keyword, resultDiv, featherType) {
            try {
                // 调用新的羽毛查询接口
                const params = new URLSearchParams({
                    type: featherType,
                    keyword: keyword || ''
                });

                const response = await fetch(`/api/feather/query?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    // 新接口直接返回处理好的内容
                    const content = data.content;

                    // 根据羽毛类型生成正确的标题
                    let title;
                    if (keyword === '') {
                        const typeNames = {
                            'all': '全部等级羽毛攻略',
                            '100': '100级羽毛攻略',
                            '110': '110级羽毛攻略',
                            '120': '120级羽毛攻略',
                            '150': '150级羽毛攻略',
                            '150-follow': '150级羽毛后续攻略'
                        };
                        title = typeNames[featherType] || '羽毛攻略';
                    } else {
                        title = `搜索结果：${keyword}`;
                    }
                    displayFeatherResult(content, resultDiv, title);
                } else {
                    resultDiv.innerHTML = `
                        <div class="pet-result">
                            <div class="pet-result-title">未找到相关内容</div>
                            <p>${data.error || '查询失败，请重试'}</p>
                        </div>
                    `;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('加载羽毛攻略失败:', error);
                resultDiv.innerHTML = `
                    <div class="pet-result">
                        <div class="pet-result-title">加载失败</div>
                        <p>无法加载羽毛攻略内容，请稍后重试。错误信息：${error.message}</p>
                    </div>
                `;
                resultDiv.style.display = 'block';
            }
        }

        // 显示羽毛攻略结果
        function displayFeatherResult(content, resultDiv, title) {
            // 处理内容，支持数组或字符串格式
            let displayContent = '';

            if (Array.isArray(content)) {
                // 如果是数组，过滤空行并连接
                const filteredLines = content.filter(line => line && line.trim() !== '');
                displayContent = filteredLines.join('<br>');
            } else if (typeof content === 'string') {
                // 如果是字符串，直接使用并转换换行符
                displayContent = content.replace(/\n/g, '<br>');
            } else {
                displayContent = '暂无内容';
            }

            resultDiv.innerHTML = `
                <div class="pet-result">
                    <div class="pet-result-title">${title}</div>
                    <div class="file-content" style="line-height: 1.8; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; word-wrap: break-word; overflow-wrap: break-word;">
                        ${displayContent || '暂无内容'}
                    </div>
                </div>
            `;
            resultDiv.style.display = 'block';
        }

        // 清空羽毛进度查询
        function clearFeatherQuery() {
            document.getElementById('featherType').value = 'all';
            document.getElementById('featherKeyword').value = '';
            document.getElementById('featherResult').style.display = 'none';
            updateFeatherKeywordState();
        }

        // 更新关键词输入框状态
        function updateFeatherKeywordState() {
            const featherType = document.getElementById('featherType').value;
            const keywordInput = document.getElementById('featherKeyword');

            if (featherType === '100') {
                keywordInput.disabled = true;
                keywordInput.placeholder = '100级羽毛无需搜索关键词';
                keywordInput.value = '';
                // 自动搜索100级羽毛内容
                searchFeather();
            } else {
                keywordInput.disabled = false;
                keywordInput.placeholder = '输入关键词搜索（留空显示全部内容）';
            }
        }

        // 页面加载完成后添加事件监听器
        document.addEventListener('DOMContentLoaded', function() {
            const featherTypeSelect = document.getElementById('featherType');
            if (featherTypeSelect) {
                featherTypeSelect.addEventListener('change', updateFeatherKeywordState);
                updateFeatherKeywordState(); // 初始化状态
            }
        });

        // 仙葫模拟数据（简化版，包含主要仙葫类型）
        const allItems = {
            "宝典灵魂仙葫": [
                { name: '【妙法莲华】七级技能书', probability: 0.003 },
                { name: '【妙法莲华】八级技能书', probability: 0.003 },
                { name: '【烈焰风暴】一级技能书', probability: 0.0075 },
                { name: '【梦魔咒】一级技能书', probability: 0.0075 },
                { name: '【仙气护体】一级技能书', probability: 0.0075 },
                { name: '【凝神聚气】一级技能书', probability: 0.0075 },
                { name: '【龙破斩】一级技能书', probability: 0.0075 },
                { name: '【同生共死】一级技能书', probability: 0.0075 },
                { name: '【腐骨蚀心】一级技能书', probability: 0.0075 },
                { name: '【穿心蚀骨】一级技能书', probability: 0.0075 },
                { name: '微缩技能经验卷轴', probability: 0.014 },
                { name: '中型技能经验神符', probability: 0.005 },
                { name: '【四相诀】七级技能书', probability: 0.005 },
                { name: '【唤灭破】七级技能书', probability: 0.005 },
                { name: '【恸地神咒】七级技能书', probability: 0.005 },
                { name: '【摄魂咒】七级技能书', probability: 0.005 },
                { name: '【魅惑术】七级技能书', probability: 0.005 },
                { name: '【暗影魔咒】七级技能书', probability: 0.005 },
                { name: '【沉水润心】七级技能书', probability: 0.005 },
                { name: '【慈悲咒】七级技能书', probability: 0.005 },
                { name: '【仙音化雨】七级技能书', probability: 0.01 },
                { name: '【天地极乐】七级技能书', probability: 0.01 },
                { name: '【昊天罡气】七级技能书', probability: 0.01 },
                { name: '【圣灵附体】七级技能书', probability: 0.01 },
                { name: '【伏魔刀法】七级技能书', probability: 0.01 },
                { name: '【六脉神剑】七级技能书', probability: 0.01 },
                { name: '【破釜沉舟】七级技能书', probability: 0.01 },
                { name: '【冷嘲热讽】七级技能书', probability: 0.01 },
                { name: '【君临天下】七级技能书', probability: 0.01 },
                { name: '【一朝归元】七级技能书', probability: 0.01 },
                { name: '【千蛛万毒手】七级技能书', probability: 0.01 },
                { name: '【暗影迷踪拳】七级技能书', probability: 0.01 },
                { name: '【化功绵掌】七级技能书', probability: 0.01 },
                { name: '【八荒六合】七级技能书', probability: 0.01 },
                { name: '【飞花溅玉】七级技能书', probability: 0.01 },
                { name: '【疾影袭心】七级技能书', probability: 0.01 }
            ],
            "乾坤八卦仙葫": [
                { name: '乾坤八卦-乾马（一阶）', probability: 0.005 },
                { name: '乾坤八卦-坤牛（一阶）', probability: 0.005 },
                { name: '乾坤八卦-巽鸡（一阶）', probability: 0.005 },
                { name: '乾坤八卦-震龙（一阶）', probability: 0.005 },
                { name: '乾坤八卦-坎猪（一阶）', probability: 0.005 },
                { name: '乾坤八卦-离雉（一阶）', probability: 0.005 },
                { name: '乾坤八卦-艮狗（一阶）', probability: 0.005 },
                { name: '乾坤八卦-兑羊（一阶）', probability: 0.005 },
                { name: '乾坤八卦-中宫（一阶）', probability: 0.002 },
                { name: '八卦强化包', probability: 0.958 }
            ],
            "洪荒仙葫": [
                { name: '高级神兽丹', probability: 0.1 },
                { name: '天赐', probability: 0.1 },
                { name: '翱翔值大礼包', probability: 0.08 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.01 },
                { name: '萝莉小仙封印魔瓶', probability: 0.01 },
                { name: '一等玄兵礼包', probability: 0.04 },
                { name: '一等灵胄礼包', probability: 0.04 },
                { name: '一等皓月礼包', probability: 0.04 },
                { name: '一等魔锻锭礼包', probability: 0.04 },
                { name: '一等魔铸锭礼包', probability: 0.04 },
                { name: '凤凰卵', probability: 0.16 },
                { name: '金龙蛋', probability: 0.04 },
                { name: '六级淡紫色灵石', probability: 0.05 },
                { name: '六级粉红色灵石', probability: 0.05 },
                { name: '洪荒福星礼包', probability: 0.2 }
            ],
            "壹陆捌仙葫": [
                { name: '禄灵召唤符', probability: 0.0006 },
                { name: '物防元魔石（四级附魔石）', probability: 0.0002 },
                { name: '法防元魔石（四级附魔石）', probability: 0.0002 },
                { name: '高级宝石合成符', probability: 0.01 },
                { name: '任意孔打孔器锦囊', probability: 0.004 },
                { name: '宝石洗孔符', probability: 0.005 },
                { name: '高级悟性丹礼包', probability: 0.01 },
                { name: '洗髓丹（玄品）', probability: 0.005 },
                { name: '骑宠洗髓丹（玄品）', probability: 0.005 },
                { name: '富贵仙葫', probability: 0.03 },
                { name: '宝典灵魂仙葫', probability: 0.03 },
                { name: '元神（蓝）', probability: 0.17 },
                { name: '补天神石', probability: 0.12 },
                { name: '技能经验丹（蓝）', probability: 0.17 },
                { name: '三级粉红色灵石', probability: 0.03 },
                { name: '三级天拜石', probability: 0.015 },
                { name: '三级天退石', probability: 0.015 },
                { name: '三级天英石', probability: 0.015 },
                { name: '三级天满石', probability: 0.015 },
                { name: '三级淡紫色灵石', probability: 0.03 },
                { name: '福星奖章', probability: 0.32 }
            ],
            "六六大顺仙葫": [
                { name: '小狐仙召唤卡', probability: 0.003 },
                { name: '精灵鼠召唤卡', probability: 0.003 },
                { name: '六级粉红色灵石', probability: 0.0003 },
                { name: '六级淡紫色灵石', probability: 0.0003 },
                { name: '翱翔值小礼包', probability: 0.005 },
                { name: '还童金丹', probability: 0.02 },
                { name: '骑宠还童金丹', probability: 0.02 },
                { name: '玄品高等宠物仙丹大礼包', probability: 0.035 },
                { name: '玄品高等骑宠仙丹大礼包', probability: 0.035 },
                { name: '4级宝石雕琢宝符（上等）', probability: 0.035 },
                { name: '稳定剂', probability: 0.02 },
                { name: '骑宠神兽还童丹礼包', probability: 0.015 },
                { name: '神兽还童丹礼包', probability: 0.015 },
                { name: '洗髓丹（灵品）', probability: 0.059 },
                { name: '骑宠洗髓丹（灵品）', probability: 0.059 },
                { name: '3级宝石雕琢宝符（上等）', probability: 0.04 },
                { name: '四级粉红色灵石', probability: 0.1 },
                { name: '3级灵兽原料', probability: 0.04 },
                { name: '四级天拜石', probability: 0.02 },
                { name: '四级天退石', probability: 0.02 },
                { name: '四级天英石', probability: 0.02 },
                { name: '四级天满石', probability: 0.02 },
                { name: '四级淡紫色灵石', probability: 0.1 },
                { name: '福星奖章包', probability: 0.3154 }
            ],
            "三元及第仙葫": [
                { name: '天赐', probability: 0.1 },
                { name: '翱翔值大礼包', probability: 0.1 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.01 },
                { name: '萝莉小仙封印魔瓶', probability: 0.01 },
                { name: '一等玄兵礼包', probability: 0.05 },
                { name: '一等灵胄礼包', probability: 0.05 },
                { name: '一等皓月礼包', probability: 0.05 },
                { name: '一等魔锻锭礼包', probability: 0.05 },
                { name: '一等魔铸锭礼包', probability: 0.05 },
                { name: '一等上古礼包', probability: 0.05 },
                { name: '六级淡紫色灵石', probability: 0.05 },
                { name: '六级粉红色灵石', probability: 0.05 },
                { name: '洪荒福星礼包', probability: 0.38 }
            ],
            "六合碧落仙葫": [
                { name: '耀阳之碧落天尊饰物礼包', probability: 0.08 },
                { name: '翱翔值大礼包', probability: 0.04 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.03 },
                { name: '萝莉小仙封印魔瓶', probability: 0.03 },
                { name: '二等玄兵礼包', probability: 0.06 },
                { name: '二等灵胄礼包', probability: 0.06 },
                { name: '二等皓月礼包', probability: 0.06 },
                { name: '二等魔锻锭礼包', probability: 0.06 },
                { name: '二等魔铸锭礼包', probability: 0.06 },
                { name: '二等上古礼包', probability: 0.06 },
                { name: '六级淡紫色灵石', probability: 0.03 },
                { name: '六级粉红色灵石', probability: 0.03 },
                { name: '六合福星礼包', probability: 0.4 }
            ],
            "六合御空仙葫": [
                { name: '耀阳之御空逐凤饰物礼包', probability: 0.08 },
                { name: '翱翔值大礼包', probability: 0.04 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.03 },
                { name: '萝莉小仙封印魔瓶', probability: 0.03 },
                { name: '二等玄兵礼包', probability: 0.06 },
                { name: '二等灵胄礼包', probability: 0.06 },
                { name: '二等皓月礼包', probability: 0.06 },
                { name: '二等魔锻锭礼包', probability: 0.06 },
                { name: '二等魔铸锭礼包', probability: 0.06 },
                { name: '二等上古礼包', probability: 0.06 },
                { name: '六级淡紫色灵石', probability: 0.03 },
                { name: '六级粉红色灵石', probability: 0.03 },
                { name: '六合福星礼包', probability: 0.4 }
            ],
            "六合撼天仙葫": [
                { name: '耀阳之撼天斗神饰物礼包', probability: 0.08 },
                { name: '翱翔值大礼包', probability: 0.04 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.03 },
                { name: '萝莉小仙封印魔瓶', probability: 0.03 },
                { name: '二等玄兵礼包', probability: 0.06 },
                { name: '二等灵胄礼包', probability: 0.06 },
                { name: '二等皓月礼包', probability: 0.06 },
                { name: '二等魔锻锭礼包', probability: 0.06 },
                { name: '二等魔铸锭礼包', probability: 0.06 },
                { name: '二等上古礼包', probability: 0.06 },
                { name: '六级淡紫色灵石', probability: 0.03 },
                { name: '六级粉红色灵石', probability: 0.03 },
                { name: '六合福星礼包', probability: 0.4 }
            ],
            "八荒碧落仙葫": [
                { name: '皓月之碧落天尊饰物', probability: 0.1 },
                { name: '翱翔值大礼包', probability: 0.08 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.04 },
                { name: '萝莉小仙封印魔瓶', probability: 0.04 },
                { name: '一等玄兵礼包', probability: 0.04 },
                { name: '一等灵胄礼包', probability: 0.04 },
                { name: '一等皓月礼包', probability: 0.04 },
                { name: '一等魔锻锭礼包', probability: 0.04 },
                { name: '一等魔铸锭礼包', probability: 0.04 },
                { name: '一等上古礼包', probability: 0.04 },
                { name: '六级淡紫色灵石', probability: 0.05 },
                { name: '六级粉红色灵石', probability: 0.05 },
                { name: '八荒福星礼包', probability: 0.4 }
            ],
            "八荒御空仙葫": [
                { name: '皓月之御空逐凤饰物', probability: 0.1 },
                { name: '翱翔值大礼包', probability: 0.08 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.04 },
                { name: '萝莉小仙封印魔瓶', probability: 0.04 },
                { name: '一等玄兵礼包', probability: 0.04 },
                { name: '一等灵胄礼包', probability: 0.04 },
                { name: '一等皓月礼包', probability: 0.04 },
                { name: '一等魔锻锭礼包', probability: 0.04 },
                { name: '一等魔铸锭礼包', probability: 0.04 },
                { name: '一等上古礼包', probability: 0.04 },
                { name: '六级淡紫色灵石', probability: 0.05 },
                { name: '六级粉红色灵石', probability: 0.05 },
                { name: '八荒福星礼包', probability: 0.4 }
            ],
            "八荒撼天仙葫": [
                { name: '皓月之撼天斗神饰物', probability: 0.1 },
                { name: '翱翔值大礼包', probability: 0.08 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.04 },
                { name: '萝莉小仙封印魔瓶', probability: 0.04 },
                { name: '一等玄兵礼包', probability: 0.04 },
                { name: '一等灵胄礼包', probability: 0.04 },
                { name: '一等皓月礼包', probability: 0.04 },
                { name: '一等魔锻锭礼包', probability: 0.04 },
                { name: '一等魔铸锭礼包', probability: 0.04 },
                { name: '一等上古礼包', probability: 0.04 },
                { name: '六级淡紫色灵石', probability: 0.05 },
                { name: '六级粉红色灵石', probability: 0.05 },
                { name: '八荒福星礼包', probability: 0.4 }
            ],
            "至尊五行符仙葫": [
                { name: '金符（五等）', probability: 0.009 },
                { name: '金符（五等）', probability: 0.009 },
                { name: '金符（五等）', probability: 0.009 },
                { name: '金符（五等）', probability: 0.009 },
                { name: '金符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '金符（五等）', probability: 0.009 },
                { name: '木符（五等）', probability: 0.009 },
                { name: '水符（五等）', probability: 0.009 },
                { name: '火符（五等）', probability: 0.009 },
                { name: '土符（五等）', probability: 0.009 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '金符（四等）', probability: 0.01 },
                { name: '木符（四等）', probability: 0.01 },
                { name: '水符（四等）', probability: 0.01 },
                { name: '火符（四等）', probability: 0.01 },
                { name: '土符（四等）', probability: 0.01 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '金符（三等）', probability: 0.007 },
                { name: '木符（三等）', probability: 0.007 },
                { name: '水符（三等）', probability: 0.007 },
                { name: '火符（三等）', probability: 0.007 },
                { name: '土符（三等）', probability: 0.007 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '金符（二等）', probability: 0.005 },
                { name: '木符（二等）', probability: 0.005 },
                { name: '水符（二等）', probability: 0.005 },
                { name: '火符（二等）', probability: 0.005 },
                { name: '土符（二等）', probability: 0.005 },
                { name: '金符（一等）', probability: 0.0023 },
                { name: '金符（一等）', probability: 0.0023 },
                { name: '金符（一等）', probability: 0.0023 },
                { name: '金符（一等）', probability: 0.0023 },
                { name: '金符（一等）', probability: 0.0023 },
                { name: '木符（一等）', probability: 0.0023 },
                { name: '木符（一等）', probability: 0.0023 },
                { name: '木符（一等）', probability: 0.0023 },
                { name: '木符（一等）', probability: 0.0023 },
                { name: '木符（一等）', probability: 0.0023 },
                { name: '水符（一等）', probability: 0.0023 },
                { name: '水符（一等）', probability: 0.0023 },
                { name: '水符（一等）', probability: 0.0023 },
                { name: '水符（一等）', probability: 0.0023 },
                { name: '水符（一等）', probability: 0.0023 },
                { name: '火符（一等）', probability: 0.0023 },
                { name: '火符（一等）', probability: 0.0023 },
                { name: '火符（一等）', probability: 0.0023 },
                { name: '火符（一等）', probability: 0.0023 },
                { name: '火符（一等）', probability: 0.0023 },
                { name: '土符（一等）', probability: 0.0024 },
                { name: '土符（一等）', probability: 0.0024 },
                { name: '土符（一等）', probability: 0.0024 },
                { name: '土符（一等）', probability: 0.0024 },
                { name: '土符（一等）', probability: 0.0024 },
                { name: '金符（一等）', probability: 0.0024 },
                { name: '木符（一等）', probability: 0.0024 },
                { name: '水符（一等）', probability: 0.0024 },
                { name: '火符（一等）', probability: 0.0024 },
                { name: '土符（一等）', probability: 0.0024 }
            ],
            "烟花": [
                { name: '小狐仙召唤卡', probability: 0.003 },
                { name: '精灵鼠召唤卡', probability: 0.003 },
                { name: '六级粉红色灵石', probability: 0.0003 },
                { name: '六级淡紫色灵石', probability: 0.0003 },
                { name: '翱翔值小礼包', probability: 0.005 },
                { name: '还童金丹', probability: 0.0199 },
                { name: '骑宠还童金丹', probability: 0.0199 },
                { name: '玄品高等宠物仙丹大礼包', probability: 0.0349 },
                { name: '玄品高等骑宠仙丹大礼包', probability: 0.0349 },
                { name: '4级宝石雕琢宝符（上等）', probability: 0.0349 },
                { name: '稳定剂', probability: 0.0199 },
                { name: '骑宠神兽还童丹礼包', probability: 0.015 },
                { name: '神兽还童丹礼包', probability: 0.015 },
                { name: '洗髓丹（灵品）', probability: 0.0588 },
                { name: '骑宠洗髓丹（灵品）', probability: 0.0588 },
                { name: '3级宝石雕琢宝符（上等）', probability: 0.0399 },
                { name: '四级粉红色灵石', probability: 0.0997 },
                { name: '3级灵兽原料', probability: 0.0399 },
                { name: '四级天拜石', probability: 0.0199 },
                { name: '四级天退石', probability: 0.0199 },
                { name: '四级天英石', probability: 0.0199 },
                { name: '四级天满石', probability: 0.0199 },
                { name: '四级淡紫色灵石', probability: 0.0997 },
                { name: '福星奖章包', probability: 0.3174 }
            ],
            "烟花球": [
                { name: '翱翔值大礼包', probability: 0.0007 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.0006 },
                { name: '萝莉小仙封印魔瓶', probability: 0.0006 },
                { name: '耀阳之撼天斗神饰物礼包', probability: 0.001 },
                { name: '耀阳之御空逐凤饰物礼包', probability: 0.001 },
                { name: '耀阳之碧落天尊饰物礼包', probability: 0.001 },
                { name: '耀阳之撼天斗神护肩礼包', probability: 0.001 },
                { name: '耀阳之御空逐凤护肩礼包', probability: 0.001 },
                { name: '耀阳之碧落天尊护肩礼包', probability: 0.001 },
                { name: '六级粉红色灵石', probability: 0.0003 },
                { name: '六级淡紫色灵石', probability: 0.0003 },
                { name: '二等玄兵礼包', probability: 0.001 },
                { name: '二等灵胄礼包', probability: 0.001 },
                { name: '二等皓月礼包', probability: 0.001 },
                { name: '二等魔锻锭礼包', probability: 0.001 },
                { name: '二等魔铸锭礼包', probability: 0.001 },
                { name: '二等上古礼包', probability: 0.001 },
                { name: '骑宠神兽还童丹礼包', probability: 0.025 },
                { name: '神兽还童丹礼包', probability: 0.025 },
                { name: '四级粉红色灵石', probability: 0.1 },
                { name: '宝石洗孔符', probability: 0.1 },
                { name: '5级宝石雕琢宝符', probability: 0.05 },
                { name: '四级淡紫色灵石', probability: 0.1 },
                { name: '稳定剂', probability: 0.0355 },
                { name: '3级灵兽原料', probability: 0.04 },
                { name: '万化灵丹促销包', probability: 0.06 },
                { name: '福星奖章包', probability: 0.45 }
            ],
            "烟花弹": [
                { name: '周年庆纪念券', probability: 0.0041 },
                { name: '节日召唤兽兑换券', probability: 0.0004 },
                { name: '翱翔值大礼包', probability: 0.0006 },
                { name: '捣蛋南瓜封印魔瓶', probability: 0.0004 },
                { name: '萝莉小仙封印魔瓶', probability: 0.0004 },
                { name: '皓月之御空逐凤饰物', probability: 0.001 },
                { name: '皓月之碧落天尊饰物', probability: 0.001 },
                { name: '皓月之撼天斗神饰物', probability: 0.001 },
                { name: '皓月之御空逐凤护肩', probability: 0.001 },
                { name: '皓月之碧落天尊护肩', probability: 0.001 },
                { name: '皓月之撼天斗神护肩', probability: 0.001 },
                { name: '六级粉红色灵石', probability: 0.0003 },
                { name: '六级淡紫色灵石', probability: 0.0003 },
                { name: '一等玄兵礼包', probability: 0.002 },
                { name: '一等灵胄礼包', probability: 0.002 },
                { name: '一等皓月礼包', probability: 0.002 },
                { name: '一等魔锻锭礼包', probability: 0.002 },
                { name: '一等魔铸锭礼包', probability: 0.002 },
                { name: '一等上古礼包', probability: 0.002 },
                { name: '白金会员包裹', probability: 0.07 },
                { name: '5级宝石雕琢宝符（上等）', probability: 0.07 },
                { name: '被封印的元神银箱', probability: 0.0055 },
                { name: '乾坤八卦仙葫超值礼包', probability: 0.05 },
                { name: '皇家仙葫', probability: 0.17 },
                { name: '技能经验丹（橙）', probability: 0.12 },
                { name: '洗髓丹（神品）', probability: 0.04 },
                { name: '福星奖章包', probability: 0.45 }
            ],
            "内丹仙葫": [
                { name: '圣阶修灵丹原石', probability: 0.00175 },
                { name: '圣阶修灵丹原石', probability: 0.00175 },
                { name: '圣阶修灵丹原石', probability: 0.00175 },
                { name: '圣阶修灵丹原石', probability: 0.00175 }, // 合计0.007
                { name: '至尊宠物内丹升级石', probability: 0.001 },
                { name: '至尊内丹提品石', probability: 0.001 },
                { name: '至尊内丹再造石', probability: 0.001 }, // 合计0.003
                { name: '高阶修灵丹原石', probability: 0.0025 },
                { name: '高阶修灵丹原石', probability: 0.0025 },
                { name: '高阶修灵丹原石', probability: 0.0025 },
                { name: '高阶修灵丹原石', probability: 0.0025 }, // 合计0.01
                { name: '上品修灵丹原石', probability: 0.0025 },
                { name: '上品修灵丹原石', probability: 0.0025 },
                { name: '上品修灵丹原石', probability: 0.0025 },
                { name: '上品修灵丹原石', probability: 0.0025 }, // 合计0.01
                { name: '万化重修丹(初等)', probability: 0.01 },
                { name: '超级宠物内丹升级石', probability: 0.01 },
                { name: '超级内丹提品石', probability: 0.01 },
                { name: '内丹变紫专用提品石', probability: 0.01 }, // 合计0.04
                { name: '弱效灵樨宝丹', probability: 0.01 },
                { name: '弱效灵樨晶露', probability: 0.01 }, // 合计0.02
                { name: '内丹变蓝专用提品石', probability: 0.04 },
                { name: '内丹变绿专用提品石', probability: 0.05 }, // 合计0.09
                { name: '初阶1-3星通用宠物内丹升级石', probability: 0.03 },
                { name: '内丹变橙专用提品石', probability: 0.04 }, // 合计0.07
                { name: '中阶4-7星通用宠物内丹升级石', probability: 0.02 },
                { name: '宠物内丹升级石', probability: 0.09 }, // 合计0.11
                { name: '弱效如意宝丹', probability: 0.06 },
                { name: '弱效如意晶露', probability: 0.02 }, // 合计0.08
                { name: '超级宠物经验神符', probability: 0.07 },
                { name: '高阶修炼原石', probability: 0.0175 }, // 0.0175
                { name: '宠物内丹升级石', probability: 0.08 }, // 0.08
                { name: '内丹再造石', probability: 0.1 }, // 0.1
                { name: '高级宠物经验神符', probability: 0.08 }, // 0.08
                { name: '元气碎片', probability: 0.07 }, // 0.07
                { name: '弱效培元晶露', probability: 0.02 },
                { name: '弱效培元宝丹', probability: 0.06 }, // 合计0.08
                { name: '弱效培元晶露', probability: 0.05 }, // 0.05
                { name: '高阶修炼原石', probability: 0.0175 },
                { name: '高阶修炼原石', probability: 0.0175 },
                { name: '高阶修炼原石', probability: 0.0175 } // 合计0.0525
            ],
            "超级内丹仙葫": [
                { name: '圣灵元丹■', probability: 0.0003 },
                { name: '圣灵元丹●', probability: 0.0003 },
                { name: '圣灵元丹▲', probability: 0.0003 },
                { name: '圣灵元丹◆', probability: 0.0003 }, // 合计0.0012
                { name: '仙人的遗骨', probability: 0.02 }, // 0.02
                { name: '遗失的法器', probability: 0.03 }, // 0.03
                { name: '仙人的经验', probability: 0.9488 } // 0.9488
            ],
            "皇家仙葫": [
                { name: '火焰之晶', probability: 0.0200 },
                { name: '黑暗之晶', probability: 0.0200 },
                { name: '皓月原石', probability: 0.0005 },
                { name: '皓月原石', probability: 0.0005 },
                { name: '皓月原石', probability: 0.0005 },
                { name: '皓月原石', probability: 0.0005 }, // 合计0.002
                { name: '举世无双悟性丹', probability: 0.0005 },
                { name: '天空之晶', probability: 0.0200 },
                { name: '神兽还童金丹', probability: 0.0400 },
                { name: '骑宠神兽还童金丹', probability: 0.0400 },
                { name: '还童金丹', probability: 0.0500 },
                { name: '骑宠还童金丹', probability: 0.0500 },
                { name: '高级宠物魂之卡', probability: 0.0700 },
                { name: '极效舍身宝丹', probability: 0.0300 },
                { name: '法防元魔石（四级附魔石）', probability: 0.0400 },
                { name: '物防元魔石（四级附魔石）', probability: 0.0400 },
                { name: '资质重生丹', probability: 0.1145 },
                { name: '骑宠资质重生丹', probability: 0.1130 },
                { name: '中级宠物魂之卡', probability: 0.1100 },
                { name: '技能经验丹（橙）礼包', probability: 0.1200 },
                { name: '元神（橙）礼包', probability: 0.1200 }
            ]
        };

        let openCount = 0;
        let currentGourdType = null;

        function resetOpenCount() {
            const newGourdType = document.getElementById('gourdType').value;
            if (currentGourdType !== newGourdType) {
                openCount = 0;
                document.getElementById('openCount').textContent = openCount;
                currentGourdType = newGourdType;
            }
        }

        function getColorByProbability(probability) {
            if (probability < 0.01) {
                return 'red';
            } else if (probability < 0.05) {
                return 'orange';
            } else if (probability < 0.1) {
                return 'purple';
            } else if (probability < 0.2) {
                return 'blue';
            } else {
                return 'green';
            }
        }

        // 防抖变量
        let gourdOpenTimeout = null;
        let isGourdOpening = false;

        function openGourd() {
            // 如果正在开启中，直接返回
            if (isGourdOpening) {
                return;
            }

            // 清除之前的延时
            if (gourdOpenTimeout) {
                clearTimeout(gourdOpenTimeout);
            }

            // 设置防抖延时
            gourdOpenTimeout = setTimeout(() => {
                performGourdOpen();
            }, 100); // 100ms防抖延迟
        }

        function performGourdOpen() {
            isGourdOpening = true;

            const gourdType = document.getElementById('gourdType').value;
            const items = allItems[gourdType];

            // 检查仙葫类型是否存在
            if (!items || !Array.isArray(items) || items.length === 0) {
                document.getElementById('gourdOpenResult').innerHTML = `<span style="color: red;">错误：未找到 ${gourdType} 的数据</span>`;
                isGourdOpening = false;
                return;
            }

            const randomNum = Math.random();
            let cumulativeProbability = 0;

            for (let i = 0; i < items.length; i++) {
                cumulativeProbability += items[i].probability;
                if (randomNum < cumulativeProbability) {
                    const itemName = items[i].name;
                    const color = getColorByProbability(items[i].probability);
                    const resultText = `恭喜你开启了 ${gourdType}，获得了：<span style="color: ${color}">${itemName}</span>`;
                    document.getElementById('gourdOpenResult').innerHTML = resultText;
                    openCount++;
                    document.getElementById('openCount').textContent = openCount;

                    const logList = document.getElementById('logList');
                    const logItem = document.createElement('li');
                    logItem.innerHTML = resultText;
                    logItem.style.padding = '8px 10px';
                    logItem.style.borderBottom = '1px solid #eee';
                    logItem.style.marginBottom = '2px';
                    logItem.style.borderRadius = '3px';
                    logList.prepend(logItem);

                    if (logList.children.length > 10) {
                        logList.removeChild(logList.lastChild);
                    }

                    // 延时后重置状态，防止连续点击
                    setTimeout(() => {
                        isGourdOpening = false;
                    }, 200);
                    return;
                }
            }

            isGourdOpening = false;
        }

        function clearGourdSim() {
            openCount = 0;
            document.getElementById('openCount').textContent = openCount;
            document.getElementById('gourdOpenResult').innerHTML = '点击"开启仙葫"开始模拟';
            document.getElementById('logList').innerHTML = '';
        }

        // 坐骑天赋经验数据
        const experienceData = [
            2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400,
            3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400,
            4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200, 5300, 5400,
            5500, 5600, 5700, 5800, 5900, 6000, 6100, 6200, 6300, 6400,
            6500, 6600, 6700, 6800, 6900, 7000, 7100, 7200, 7300, 7400
        ];

        // 计算坐骑天赋经验函数
        function calculateMountTalentExperience(start, end) {
            if (isNaN(start) || isNaN(end)) {
                return "输入无效";
            }

            if (start < 1 || start > 49 || end < 2 || end > 50) {
                return "等级范围应为1-50，且初始等级必须小于目标等级";
            }

            if (start >= end) {
                return "目标等级必须大于初始等级";
            }

            let total = 0;
            for (let i = start; i < end; i++) {
                total += experienceData[i-1];
            }

            return total.toLocaleString();
        }

        // 计算融会贯通数量
        function calculateFusion(total) {
            if (isNaN(total)) return "0";
            const fusion = Math.ceil(total / 50);
            return fusion.toLocaleString();
        }

        // 坐骑天赋计算
        function calculateMountTalent(calcNum) {
            const startInput = document.getElementById(`start${calcNum}`);
            const endInput = document.getElementById(`end${calcNum}`);
            const resultElement = document.getElementById(`result${calcNum}`);

            const start = parseInt(startInput.value);
            const end = parseInt(endInput.value);

            // 自动调整目标等级，确保大于初始等级
            if (end <= start) {
                endInput.value = start + 1;
                end = start + 1;
            }

            const result = calculateMountTalentExperience(start, end);
            resultElement.textContent = result;

            // 计算总结果
            updateMountTalentTotalResult();
        }

        // 更新坐骑天赋总结果
        function updateMountTalentTotalResult() {
            const results = [];
            for (let i = 1; i <= 3; i++) {
                const resultText = document.getElementById(`result${i}`).textContent;
                const resultNum = parseInt(resultText.replace(/,/g, ''));
                if (!isNaN(resultNum)) {
                    results.push(resultNum);
                }
            }

            if (results.length === 3) {
                const total = results.reduce((acc, val) => acc + val, 0);
                document.getElementById('totalResult').textContent = total.toLocaleString();

                // 计算并显示融会贯通数量
                const fusionResult = calculateFusion(total);
                document.getElementById('fusionResult').textContent = fusionResult;
            }
        }

        // 清空坐骑天赋计算
        function clearMountTalent() {
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`start${i}`).value = i === 1 ? '1' : (i === 2 ? '10' : '20');
                document.getElementById(`end${i}`).value = i === 1 ? '10' : (i === 2 ? '20' : '30');
                document.getElementById(`result${i}`).textContent = '0';
            }
            document.getElementById('totalResult').textContent = '0';
            document.getElementById('fusionResult').textContent = '0';
        }

        // 圣技经验计算数据
        const holySkillData = [
            [1, 0, 0, 0, 0, 0, 0],
            [2, 485e8, 20.4e4, 187.6e4, 20.4e4, 0, 0],
            [3, 490e8, 20.8e4, 188.5e4, 20.8e4, 0, 0],
            [4, 495e8, 21.2e4, 190.8e4, 21.2e4, 0, 0],
            [5, 500e8, 21.6e4, 194.4e4, 21.6e4, 0, 0],
            [6, 505e8, 22.0e4, 198.0e4, 22.0e4, 15.0e4, 70],
            [7, 510e8, 22.4e4, 201.6e4, 22.4e4, 0, 0],
            [8, 515e8, 22.8e4, 205.2e4, 22.8e4, 0, 0],
            [9, 520e8, 23.2e4, 208.8e4, 23.2e4, 0, 0],
            [10, 525e8, 23.6e4, 212.4e4, 23.6e4, 0, 0],
            [11, 530e8, 24.0e4, 216.0e4, 24.0e4, 20.0e4, 75],
            [12, 535e8, 24.4e4, 219.6e4, 24.4e4, 0, 0],
            [13, 540e8, 24.8e4, 223.2e4, 24.8e4, 0, 0],
            [14, 545e8, 25.2e4, 226.8e4, 25.2e4, 0, 0],
            [15, 550e8, 25.6e4, 230.4e4, 25.6e4, 0, 0],
            [16, 555e8, 26.0e4, 234.0e4, 26.0e4, 25.0e4, 80],
            [17, 560e8, 26.4e4, 237.6e4, 26.4e4, 0, 0],
            [18, 565e8, 26.8e4, 241.2e4, 26.8e4, 0, 0],
            [19, 570e8, 27.2e4, 244.8e4, 27.2e4, 0, 0],
            [20, 575e8, 27.6e4, 248.4e4, 27.6e4, 0, 0],
            [21, 580e8, 28.0e4, 252.0e4, 28.0e4, 30.0e4, 85],
            [22, 585e8, 28.4e4, 255.6e4, 28.4e4, 0, 0],
            [23, 590e8, 28.8e4, 259.2e4, 28.8e4, 0, 0],
            [24, 595e8, 29.2e4, 262.8e4, 29.2e4, 0, 0],
            [25, 600e8, 29.6e4, 266.4e4, 29.6e4, 0, 0],
            [26, 605e8, 30.0e4, 270.0e4, 30.0e4, 35.0e4, 90],
            [27, 610e8, 30.4e4, 273.6e4, 30.4e4, 0, 0],
            [28, 615e8, 30.8e4, 277.2e4, 30.8e4, 0, 0],
            [29, 620e8, 31.2e4, 280.8e4, 31.2e4, 0, 0],
            [30, 625e8, 31.6e4, 284.4e4, 31.6e4, 0, 0],
            [31, 630e8, 32.0e4, 288.0e4, 32.0e4, 40.0e4, 95],
            [32, 635e8, 32.4e4, 291.6e4, 32.4e4, 0, 0],
            [33, 640e8, 32.8e4, 295.2e4, 32.8e4, 0, 0],
            [34, 645e8, 33.2e4, 298.8e4, 33.2e4, 0, 0],
            [35, 650e8, 33.6e4, 302.4e4, 33.6e4, 0, 0],
            [36, 655e8, 34.0e4, 306.0e4, 34.0e4, 45.0e4, 100],
            [37, 660e8, 34.4e4, 309.6e4, 34.4e4, 0, 0],
            [38, 665e8, 34.8e4, 313.2e4, 34.8e4, 0, 0],
            [39, 670e8, 35.2e4, 316.8e4, 35.2e4, 0, 0],
            [40, 675e8, 35.6e4, 320.4e4, 35.6e4, 0, 0],
            [41, 680e8, 36.0e4, 324.0e4, 36.0e4, 50.0e4, 105],
            [42, 685e8, 36.4e4, 327.6e4, 36.4e4, 0, 0],
            [43, 690e8, 36.8e4, 331.2e4, 36.8e4, 0, 0],
            [44, 695e8, 37.2e4, 334.8e4, 37.2e4, 0, 0],
            [45, 700e8, 37.6e4, 338.4e4, 37.6e4, 0, 0],
            [46, 705e8, 38.0e4, 342.0e4, 38.0e4, 55.0e4, 110],
            [47, 710e8, 38.4e4, 345.6e4, 38.4e4, 0, 0],
            [48, 715e8, 38.8e4, 349.2e4, 38.8e4, 0, 0],
            [49, 720e8, 39.2e4, 352.8e4, 39.2e4, 0, 0],
            [50, 725e8, 39.6e4, 356.4e4, 39.6e4, 0, 0],
            [51, 730e8, 40.0e4, 360.0e4, 40.0e4, 60.0e4, 115],
            [52, 735e8, 40.4e4, 363.6e4, 40.4e4, 0, 0],
            [53, 740e8, 40.8e4, 367.2e4, 40.8e4, 0, 0],
            [54, 745e8, 41.2e4, 370.8e4, 41.2e4, 0, 0],
            [55, 750e8, 41.6e4, 374.4e4, 41.6e4, 0, 0],
            [56, 755e8, 42.0e4, 378.0e4, 42.0e4, 65.0e4, 120],
            [57, 760e8, 42.4e4, 381.6e4, 42.4e4, 0, 0],
            [58, 765e8, 42.8e4, 385.2e4, 42.8e4, 0, 0],
            [59, 770e8, 43.2e4, 388.8e4, 43.2e4, 0, 0],
            [60, 775e8, 43.6e4, 392.4e4, 43.6e4, 0, 0],
            [61, 780e8, 44.0e4, 396.0e4, 44.0e4, 70.0e4, 125],
            [62, 785e8, 44.4e4, 399.6e4, 44.4e4, 0, 0],
            [63, 790e8, 44.8e4, 403.2e4, 44.8e4, 0, 0],
            [64, 795e8, 45.2e4, 406.8e4, 45.2e4, 0, 0],
            [65, 800e8, 45.6e4, 410.4e4, 45.6e4, 0, 0],
            [66, 805e8, 46.0e4, 414.0e4, 46.0e4, 75.0e4, 130],
            [67, 810e8, 46.4e4, 417.6e4, 46.4e4, 0, 0],
            [68, 815e8, 46.8e4, 421.2e4, 46.8e4, 0, 0],
            [69, 820e8, 47.2e4, 424.8e4, 47.2e4, 0, 0],
            [70, 825e8, 47.6e4, 428.4e4, 47.6e4, 0, 0],
            [71, 830e8, 48.0e4, 432.0e4, 48.0e4, 80.0e4, 135],
            [72, 835e8, 48.4e4, 435.6e4, 48.4e4, 0, 0],
            [73, 840e8, 48.8e4, 439.2e4, 48.8e4, 0, 0],
            [74, 845e8, 49.2e4, 442.8e4, 49.2e4, 0, 0],
            [75, 850e8, 49.6e4, 446.4e4, 49.6e4, 0, 0],
            [76, 855e8, 50.0e4, 450.0e4, 50.0e4, 85.0e4, 140],
            [77, 860e8, 50.4e4, 453.6e4, 50.4e4, 0, 0],
            [78, 865e8, 50.8e4, 457.2e4, 50.8e4, 0, 0],
            [79, 870e8, 51.2e4, 460.8e4, 51.2e4, 0, 0],
            [80, 875e8, 51.6e4, 464.4e4, 51.6e4, 0, 0],
            [81, 880e8, 52.0e4, 468.0e4, 52.0e4, 90.0e4, 145],
            [82, 885e8, 52.4e4, 471.6e4, 52.4e4, 0, 0],
            [83, 890e8, 52.8e4, 475.2e4, 52.8e4, 0, 0],
            [84, 895e8, 53.2e4, 478.8e4, 53.2e4, 0, 0],
            [85, 900e8, 53.6e4, 482.4e4, 53.6e4, 0, 0],
            [86, 905e8, 54.0e4, 486.0e4, 54.0e4, 95.0e4, 150],
            [87, 910e8, 54.4e4, 489.6e4, 54.4e4, 0, 0],
            [88, 915e8, 54.8e4, 493.2e4, 54.8e4, 0, 0],
            [89, 920e8, 55.2e4, 496.8e4, 55.2e4, 0, 0],
            [90, 925e8, 55.6e4, 500.4e4, 55.6e4, 0, 0],
            [91, 930e8, 56.0e4, 504.0e4, 56.0e4, 100.0e4, 155],
            [92, 935e8, 56.4e4, 507.6e4, 56.4e4, 0, 0],
            [93, 940e8, 56.8e4, 511.2e4, 56.8e4, 0, 0],
            [94, 945e8, 57.2e4, 514.8e4, 57.2e4, 0, 0],
            [95, 950e8, 57.6e4, 518.4e4, 57.6e4, 0, 0],
            [96, 955e8, 58.0e4, 522.0e4, 58.0e4, 105.0e4, 160],
            [97, 960e8, 58.4e4, 525.6e4, 58.4e4, 0, 0],
            [98, 965e8, 58.8e4, 529.2e4, 58.8e4, 0, 0],
            [99, 970e8, 59.2e4, 532.8e4, 59.2e4, 0, 0],
            [100, 975e8, 59.6e4, 536.4e4, 59.6e4, 0, 0]
        ];

        function addUnit(num) {
            if (num >= 1e8) {
                return (num / 1e8).toFixed(2) + '亿';
            } else if (num >= 1e4) {
                return (num / 1e4).toFixed(2) + '万';
            }
            return num.toString();
        }

        // 圣技经验计算
        function calculateHolySkill() {
            const startLevel = parseInt(document.getElementById('holyStartLevel').value);
            const endLevel = parseInt(document.getElementById('holyEndLevel').value);
            const resultDiv = document.getElementById('holySkillResult');

            if (isNaN(startLevel) || isNaN(endLevel) || startLevel < 1 || startLevel > 100 || endLevel < 1 || endLevel > 100) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center; padding: 20px;">
                        请输入 1 到 100 之间的有效等级。
                    </div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            if (startLevel > endLevel) {
                resultDiv.innerHTML = `
                    <div class="pet-result-title">错误</div>
                    <div style="color: #e74c3c; text-align: center; padding: 20px;">
                        起始等级不能大于目标等级。
                    </div>
                `;
                resultDiv.style.display = 'block';
                return;
            }

            let totalCharacterExp = 0;
            let totalSkillExp = 0;
            let totalSpirit = 0;
            let totalHolySkillExp = 0;
            let totalBreakthroughSkillBook = 0;
            let totalChaoyunBadge = 0;

            for (let i = startLevel; i <= endLevel; i++) {
                const row = holySkillData[i - 1];
                totalCharacterExp += row[1];
                totalSkillExp += row[2];
                totalSpirit += row[3];
                totalHolySkillExp += row[4];
                totalBreakthroughSkillBook += row[5];
                totalChaoyunBadge += row[6];
            }

            const doubleTotalCharacterExp = totalCharacterExp * 2;
            const doubleTotalSkillExp = totalSkillExp * 2;
            const doubleTotalSpirit = totalSpirit * 2;
            const doubleTotalHolySkillExp = totalHolySkillExp * 2;
            const doubleTotalBreakthroughSkillBook = totalBreakthroughSkillBook * 2;
            const doubleTotalChaoyunBadge = totalChaoyunBadge * 2;

            document.getElementById('totalCharacterExp').textContent = addUnit(totalCharacterExp);
            document.getElementById('doubleTotalCharacterExp').textContent = addUnit(doubleTotalCharacterExp);
            document.getElementById('totalSkillExp').textContent = addUnit(totalSkillExp);
            document.getElementById('doubleTotalSkillExp').textContent = addUnit(doubleTotalSkillExp);
            document.getElementById('totalSpirit').textContent = addUnit(totalSpirit);
            document.getElementById('doubleTotalSpirit').textContent = addUnit(doubleTotalSpirit);
            document.getElementById('totalHolySkillExp').textContent = addUnit(totalHolySkillExp);
            document.getElementById('doubleTotalHolySkillExp').textContent = addUnit(doubleTotalHolySkillExp);
            document.getElementById('totalBreakthroughSkillBook').textContent = addUnit(totalBreakthroughSkillBook);
            document.getElementById('doubleTotalBreakthroughSkillBook').textContent = addUnit(doubleTotalBreakthroughSkillBook);
            document.getElementById('totalChaoyunBadge').textContent = addUnit(totalChaoyunBadge);
            document.getElementById('doubleTotalChaoyunBadge').textContent = addUnit(doubleTotalChaoyunBadge);

            resultDiv.style.display = 'block';
        }

        // 清空圣技经验计算
        function clearHolySkill() {
            document.getElementById('holyStartLevel').value = '1';
            document.getElementById('holyEndLevel').value = '100';
            document.getElementById('holySkillResult').style.display = 'none';
        }

        // 攻略页面功能

        // 搜索输入实时提示
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                let searchTimeout;

                searchInput.addEventListener('input', function() {
                    // 只更新清空按钮状态，不进行自动搜索
                    toggleClearButton();

                    // 隐藏建议框
                    const suggestions = document.getElementById('suggestions');
                    if (suggestions) {
                        suggestions.style.display = 'none';
                    }
                });

                // 支持回车键搜索
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        searchGuides();
                    } else if (e.key === 'Escape') {
                        document.getElementById('suggestions').style.display = 'none';
                    }
                });
            }

            // 点击页面其他地方隐藏建议框
            document.addEventListener('click', function(e) {
                const searchBox = document.querySelector('.search-box');
                if (searchBox && !searchBox.contains(e.target)) {
                    const suggestions = document.getElementById('suggestions');
                    if (suggestions) {
                        suggestions.style.display = 'none';
                    }
                }
            });
        });

        // 用于跟踪当前的搜索请求
        let currentSearchRequest = null;
        let currentKeywordRequest = null;

        // 搜索缓存
        let searchCache = {
            lastQuery: null,
            lastSuggestions: null
        };

        // 向服务器搜索关键词
        function searchGuideKeywords(query) {
            const suggestions = document.getElementById('suggestions');

            if (!query || query.length === 0) {
                suggestions.style.display = 'none';
                searchCache.lastSuggestions = null;
                return;
            }

            // 如果查询内容与缓存相同，直接显示缓存的建议
            if (searchCache.lastQuery === query && searchCache.lastSuggestions) {
                suggestions.innerHTML = searchCache.lastSuggestions;
                suggestions.style.display = 'block';
                return;
            }

            // 取消之前的关键词搜索请求
            if (currentKeywordRequest) {
                currentKeywordRequest.abort();
            }

            // 显示加载状态
            suggestions.innerHTML = '<div class="suggestion-item" style="color: #7f8c8d;"><i class="fas fa-spinner fa-spin"></i> 搜索中...</div>';
            suggestions.style.display = 'block';

            // 创建新的AbortController
            const controller = new AbortController();
            currentKeywordRequest = controller;

            fetch(`/api/guides/search?q=${encodeURIComponent(query)}`, {
                signal: controller.signal
            })
                .then(response => response.ok ? response.json() : Promise.reject('搜索失败'))
                .then(data => {
                    // 检查请求是否已被取消
                    if (controller.signal.aborted) return;

                    if (data.success && data.results && data.results.length > 0) {
                        suggestions.innerHTML = data.results.map(item => {
                            const highlightedName = highlightMatch(item.title, query);
                            return `<div class="suggestion-item" onclick="selectSuggestion('${item.filename}')">${highlightedName}</div>`;
                        }).join('');
                        suggestions.style.display = 'block';
                    } else {
                        suggestions.innerHTML = '<div class="suggestion-item" style="color: #7f8c8d;">未找到相关内容</div>';
                        suggestions.style.display = 'block';
                        // 3秒后自动隐藏
                        setTimeout(() => {
                            if (!controller.signal.aborted) {
                                suggestions.style.display = 'none';
                            }
                        }, 3000);
                    }
                })
                .catch(error => {
                    // 如果是因为取消请求导致的错误，不显示错误信息
                    if (error.name === 'AbortError') return;

                    console.error('搜索关键词失败:', error);
                    if (!controller.signal.aborted) {
                        suggestions.innerHTML = '<div class="suggestion-item" style="color: #e74c3c;">搜索失败，请稍后重试</div>';
                        suggestions.style.display = 'block';
                        // 3秒后自动隐藏
                        setTimeout(() => {
                            if (!controller.signal.aborted) {
                                suggestions.style.display = 'none';
                            }
                        }, 3000);
                    }
                })
                .finally(() => {
                    // 清理当前请求引用
                    if (currentKeywordRequest === controller) {
                        currentKeywordRequest = null;
                    }
                });
        }



        // 高亮匹配的文本
        function highlightMatch(text, query) {
            if (!query) return text;

            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<strong style="color: #3498db;">$1</strong>');
        }

        // 选择建议项
        function selectSuggestion(filename) {
            const searchInput = document.getElementById('searchInput');
            const suggestions = document.getElementById('suggestions');
            if (searchInput) {
                searchInput.value = filename.replace('.txt', '');
                toggleClearButton(); // 更新清空按钮状态
            }
            if (suggestions) {
                suggestions.style.display = 'none';
            }
            searchGuides();
        }

        // 清空搜索
        function clearSearch() {
            const searchInput = document.getElementById('searchInput');
            const suggestions = document.getElementById('suggestions');
            const resultsContainer = document.getElementById('resultsContainer');

            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            if (suggestions) {
                suggestions.style.display = 'none';
            }
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            toggleClearButton();
        }

        // 切换清空按钮的显示状态
        function toggleClearButton() {
            const searchInput = document.getElementById('searchInput');
            const clearBtn = document.getElementById('clearSearchBtn');

            if (searchInput && clearBtn) {
                if (searchInput.value.trim().length > 0) {
                    clearBtn.classList.add('show');
                } else {
                    clearBtn.classList.remove('show');
                }
            }
        }

        // 加载随机30条攻略
        async function loadRandomGuides() {
            const resultsContainer = document.getElementById('resultsContainer');
            if (!resultsContainer) return;

            // 显示加载状态
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 15px; color: #3498db;"></i>
                    <div style="font-size: 18px; margin-bottom: 10px;">加载随机攻略中...</div>
                    <div style="font-size: 14px;">请稍候</div>
                </div>
            `;
            resultsContainer.style.display = 'block';

            try {
                // 调用后端API获取随机30条攻略
                const response = await fetch('/api/guides/random?limit=30');
                if (!response.ok) {
                    throw new Error('获取随机攻略失败');
                }

                const data = await response.json();

                if (data.success && data.guides && data.guides.length > 0) {
                    resultsContainer.innerHTML = data.guides.map((item, index) => {
                        return `
                            <div class="result-item" id="result-${index}">
                                <div class="result-header" onclick="toggleResult(${index}, '${item.id}')">
                                    <div class="result-title">${item.title}</div>
                                    <i class="fas fa-chevron-down result-toggle"></i>
                                </div>
                                <div class="result-content" id="content-${index}">
                                    <div id="file-content-${index}" class="file-content">
                                        <div style="text-align: center; padding: 20px; color: #7f8c8d;">
                                            点击标题展开查看详细内容
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    resultsContainer.style.display = 'block';

                    // 不再自动加载文件内容，只有用户点击时才加载
                } else {
                    resultsContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-book" style="font-size: 48px; margin-bottom: 15px; color: #bdc3c7;"></i>
                            <div style="font-size: 18px; margin-bottom: 10px;">暂无攻略内容</div>
                            <div style="font-size: 14px;">请稍后再试</div>
                        </div>
                    `;
                    resultsContainer.style.display = 'block';
                }
            } catch (error) {
                console.error('加载随机攻略失败:', error);
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <div style="font-size: 18px; margin-bottom: 10px;">加载失败</div>
                        <div style="font-size: 14px;">请检查网络连接后重试</div>
                    </div>
                `;
                resultsContainer.style.display = 'block';
            }
        }

        // 搜索攻略
        function searchGuides() {
            const searchInput = document.getElementById('searchInput');
            const resultsContainer = document.getElementById('resultsContainer');
            const suggestions = document.getElementById('suggestions');

            if (!searchInput || !resultsContainer) return;

            const query = searchInput.value.trim();

            // 隐藏建议框
            if (suggestions) {
                suggestions.style.display = 'none';
            }

            if (query.length === 0) {
                // 当搜索框为空时，显示随机30条攻略
                loadRandomGuides();
                return;
            }

            // 取消之前的搜索请求
            if (currentSearchRequest) {
                currentSearchRequest.abort();
            }

            // 显示加载状态
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 15px; color: #3498db;"></i>
                    <div style="font-size: 18px; margin-bottom: 10px;">搜索中...</div>
                    <div style="font-size: 14px;">请稍候</div>
                </div>
            `;
            resultsContainer.style.display = 'block';

            // 创建新的AbortController
            const controller = new AbortController();
            currentSearchRequest = controller;

            // 向服务器搜索
            fetch(`/api/guides/search?q=${encodeURIComponent(query)}`, {
                signal: controller.signal
            })
                .then(response => response.ok ? response.json() : Promise.reject('搜索失败'))
                .then(data => {
                    // 检查请求是否已被取消
                    if (controller.signal.aborted) return;

                    if (data.success && data.guides && data.guides.length > 0) {
                        resultsContainer.innerHTML = data.guides.map((item, index) => {
                            const highlightedName = highlightMatch(item.title, query);
                            return `
                                <div class="result-item" id="result-${index}">
                                    <div class="result-header" onclick="toggleResult(${index}, '${item.id}')">
                                        <div class="result-title">${highlightedName}</div>
                                        <i class="fas fa-chevron-down result-toggle"></i>
                                    </div>
                                    <div class="result-content" id="content-${index}">
                                        <div id="file-content-${index}" class="file-content">
                                            <div style="text-align: center; padding: 20px; color: #7f8c8d;">
                                                点击标题展开查看详细内容
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                        resultsContainer.style.display = 'block';

                        // 不再自动加载文件内容，只有用户点击时才加载
                    } else {
                        resultsContainer.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; color: #bdc3c7;"></i>
                                <div style="font-size: 18px; margin-bottom: 10px;">未找到相关攻略</div>
                                <div style="font-size: 14px;">请尝试其他关键词</div>
                            </div>
                        `;
                        resultsContainer.style.display = 'block';
                    }
                })
                .catch(error => {
                    // 如果是因为取消请求导致的错误，不显示错误信息
                    if (error.name === 'AbortError') return;

                    console.error('搜索攻略失败:', error);
                    if (!controller.signal.aborted) {
                        resultsContainer.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                                <div style="font-size: 18px; margin-bottom: 10px;">搜索失败</div>
                                <div style="font-size: 14px;">请检查网络连接后重试</div>
                            </div>
                        `;
                        resultsContainer.style.display = 'block';
                    }
                })
                .finally(() => {
                    // 清理当前请求引用
                    if (currentSearchRequest === controller) {
                        currentSearchRequest = null;
                    }
                });
        }

        // 显示攻略上传模态框
        function showUploadGuideModal() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            const modal = document.getElementById('upload-guide-modal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 清空表单
            document.getElementById('guide-title').value = '';
            document.getElementById('guide-content').value = '';
        }

        // 关闭攻略上传模态框
        function closeUploadGuideModal() {
            const modal = document.getElementById('upload-guide-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 插入图片
        function insertImage() {
            const input = document.getElementById('guide-image-input');
            input.click();
        }

        // 处理图片上传
        async function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                showNotification('请选择图片文件', 'error');
                return;
            }

            // 检查文件大小 (20MB)
            if (file.size > 20 * 1024 * 1024) {
                showNotification('图片大小不能超过20MB', 'error');
                return;
            }

            // 获取插入图片按钮
            const insertBtn = document.querySelector('.toolbar-btn[onclick="insertImage()"]');
            const originalContent = insertBtn.innerHTML;

            try {
                // 禁用按钮并显示上传状态
                insertBtn.disabled = true;
                insertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传图片中...';
                insertBtn.style.pointerEvents = 'none';
                insertBtn.style.opacity = '0.6';

                // 显示上传进度
                showNotification('正在上传图片...', 'info');

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.code === 200 && data.data) {
                    const imageUrl = typeof data.data === 'string' ? data.data : data.data.url;

                    // 插入图片到内容中
                    const textarea = document.getElementById('guide-content');
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(cursorPos);

                    textarea.value = textBefore + `\n![图片](${imageUrl})\n` + textAfter;

                    // 设置光标位置
                    const newPos = cursorPos + imageUrl.length + 12;
                    textarea.setSelectionRange(newPos, newPos);
                    textarea.focus();

                    showNotification('图片上传成功', 'success');
                } else {
                    showNotification('图片上传失败', 'error');
                }
            } catch (error) {
                console.error('图片上传错误:', error);
                showNotification('图片上传失败，请重试', 'error');
            } finally {
                // 恢复按钮状态
                insertBtn.disabled = false;
                insertBtn.innerHTML = originalContent;
                insertBtn.style.pointerEvents = 'auto';
                insertBtn.style.opacity = '1';

                // 清空文件输入
                event.target.value = '';
            }
        }

        // 预览攻略
        function previewGuide() {
            const title = document.getElementById('guide-title').value.trim();
            const content = document.getElementById('guide-content').value.trim();

            if (!title) {
                showNotification('请输入攻略标题', 'error');
                return;
            }

            if (title.length > 20) {
                showNotification('攻略标题最多20个字', 'error');
                return;
            }

            if (!content) {
                showNotification('请输入攻略内容', 'error');
                return;
            }

            // 隐藏上传模态框（不清空数据）
            const uploadModal = document.getElementById('upload-guide-modal');
            uploadModal.style.display = 'none';

            // 显示预览模态框
            const previewModal = document.getElementById('preview-guide-modal');
            const previewTitle = document.getElementById('preview-title');
            const previewBody = document.getElementById('preview-body');

            previewTitle.textContent = title;

            // 简单的Markdown渲染 - 支持多种图片格式
            let htmlContent = content
                .replace(/\n/g, '<br>')
                // 支持 [img]url[/img] 格式
                .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" alt="攻略图片" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">')
                // 支持 Markdown 格式 ![alt](url)
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">');

            previewBody.innerHTML = htmlContent;

            previewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 关闭攻略预览模态框
        function closePreviewGuideModal() {
            const modal = document.getElementById('preview-guide-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 返回编辑攻略
        function returnToEditGuide() {
            // 关闭预览模态框
            closePreviewGuideModal();
            // 显示编辑模态框（数据已保留）
            const uploadModal = document.getElementById('upload-guide-modal');
            uploadModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }



        // 发布攻略
        async function publishGuide() {
            const title = document.getElementById('guide-title').value.trim();
            const content = document.getElementById('guide-content').value.trim();

            if (!title || !content) {
                showNotification('标题和内容不能为空', 'error');
                return;
            }

            if (title.length > 20) {
                showNotification('攻略标题最多20个字', 'error');
                return;
            }

            try {
                const response = await fetch('/api/guides/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        title: title,
                        content: content
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showSuccessBubble('上传成功，正在提交管理员审核！');
                    closePreviewGuideModal();

                    // 清空表单
                    document.getElementById('guide-title').value = '';
                    document.getElementById('guide-content').value = '';
                } else {
                    showNotification(data.message || '发布失败', 'error');
                }
            } catch (error) {
                console.error('发布攻略错误:', error);
                showNotification('发布失败，请重试', 'error');
            }
        }

        // 更新上传攻略按钮显示状态
        function updateUploadGuideButton() {
            const uploadBtn = document.getElementById('uploadGuideBtn');
            const uploadBtnHeader = document.getElementById('uploadGuideBtnHeader');

            if (uploadBtn) {
                if (userToken) {
                    uploadBtn.style.display = 'flex';
                } else {
                    uploadBtn.style.display = 'none';
                }
            }

            if (uploadBtnHeader) {
                if (userToken) {
                    uploadBtnHeader.style.display = 'flex';
                } else {
                    uploadBtnHeader.style.display = 'none';
                }
            }
        }

        // 更新攻略奖励信息显示
        async function updateGuideRewardInfo() {
            const rewardInfo = document.getElementById('guide-reward-info');
            const rewardAmount = document.getElementById('guide-reward-amount');

            if (userToken) {
                try {
                    // 获取奖励配置
                    const response = await fetch('/api/config/guide-reward');
                    const data = await response.json();

                    if (data.success) {
                        rewardAmount.textContent = data.reward;
                        rewardInfo.style.display = 'flex';
                    } else {
                        rewardInfo.style.display = 'none';
                    }
                } catch (error) {
                    console.error('获取奖励配置错误:', error);
                    rewardInfo.style.display = 'none';
                }
            } else {
                rewardInfo.style.display = 'none';
            }
        }

        // 商品上架相关变量
        let uploadedItemImages = [];
        let selectedItemTypes = [];

        // 显示商品上架模态框
        function showUploadItemModal() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            const modal = document.getElementById('upload-item-modal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 清空表单
            document.getElementById('item-title').value = '';
            document.getElementById('item-price').value = '';
            document.getElementById('item-server').value = '';
            document.getElementById('item-contact').value = '';
            document.getElementById('item-days').value = '7';
            document.getElementById('item-type-input').value = '';

            uploadedItemImages = [];
            selectedItemTypes = [];
            updateUploadedImages();
            updateSelectedTypes();

            // 加载上架费用并更新显示
            loadListingFee();

            // 初始化类型输入框事件
            initTypeInput();
            // 初始化天数输入框事件
            initDaysInput();
        }

        // 关闭商品上架模态框
        function closeUploadItemModal() {
            const modal = document.getElementById('upload-item-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 初始化类型输入框
        function initTypeInput() {
            const typeInput = document.getElementById('item-type-input');
            if (typeInput) {
                // 保留回车键添加功能（PC端）
                typeInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addItemType();
                    }
                });

                // 添加失去焦点事件（移动端友好）
                typeInput.addEventListener('blur', function(e) {
                    // 延迟执行，避免与其他点击事件冲突
                    setTimeout(() => {
                        if (e.target.value.trim()) {
                            addItemType();
                        }
                    }, 100);
                });
            }
        }

        // 初始化天数输入框
        function initDaysInput() {
            const daysInput = document.getElementById('item-days');
            if (daysInput) {
                daysInput.addEventListener('input', updateTotalFee);
            }
        }

        // 添加商品类型
        function addItemType() {
            const typeInput = document.getElementById('item-type-input');
            const type = typeInput.value.trim();

            if (!type) return;

            if (selectedItemTypes.length >= 3) {
                showNotification('最多只能添加3个类型', 'error');
                return;
            }

            if (selectedItemTypes.includes(type)) {
                showNotification('该类型已存在', 'error');
                return;
            }

            selectedItemTypes.push(type);
            typeInput.value = '';
            updateSelectedTypes();
        }

        // 移除商品类型
        function removeItemType(type) {
            selectedItemTypes = selectedItemTypes.filter(t => t !== type);
            updateSelectedTypes();
        }

        // 更新选中的类型显示
        function updateSelectedTypes() {
            const container = document.getElementById('selected-types');
            container.innerHTML = selectedItemTypes.map(type => `
                <div class="type-tag">
                    ${type}
                    <span class="remove-type" onclick="removeItemType('${type}')">&times;</span>
                </div>
            `).join('');
        }

        // 全局变量存储上架费用
        let globalDailyFee = 1;

        // 获取上架费用配置
        async function loadListingFee() {
            try {
                const response = await fetch('/api/config/listing-fee');
                const data = await response.json();
                globalDailyFee = data.success ? data.fee : 1;

                // 更新显示
                updateTotalFee();
            } catch (error) {
                console.error('获取上架费用失败:', error);
                globalDailyFee = 1;
            }
        }

        // 更新总费用显示
        function updateTotalFee() {
            const daysInput = document.getElementById('item-days');
            const dailyFeeSpan = document.getElementById('daily-fee');
            const totalFeeSpan = document.getElementById('total-fee');

            const days = parseInt(daysInput.value) || 1;
            const totalFee = days * globalDailyFee;

            dailyFeeSpan.textContent = globalDailyFee;
            totalFeeSpan.textContent = totalFee;
        }

        // 处理商品图片上传
        async function handleItemImagesUpload(event) {
            const files = Array.from(event.target.files);
            const placeholder = document.querySelector('.upload-placeholder');
            const fileInput = document.getElementById('item-images');

            if (uploadedItemImages.length + files.length > 5) {
                showNotification('最多只能上传5张图片', 'error');
                return;
            }

            // 禁用上传区域
            placeholder.style.pointerEvents = 'none';
            placeholder.style.opacity = '0.6';
            fileInput.disabled = true;

            // 显示上传状态
            const originalContent = placeholder.innerHTML;

            let completedUploads = 0;
            const totalFiles = files.length;

            // 更新上传状态显示
            function updateUploadStatus() {
                placeholder.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>图片上传中... (${completedUploads}/${totalFiles})</p>
                    <div class="upload-progress">
                        <div class="progress-bar" id="upload-progress-bar"></div>
                    </div>
                    <small>正在上传第 ${completedUploads + 1} 张图片</small>
                `;

                const progressBar = document.getElementById('upload-progress-bar');
                if (progressBar) {
                    const progress = (completedUploads / totalFiles) * 100;
                    progressBar.style.width = progress + '%';
                }
            }

            // 更新进度函数
            function updateProgress() {
                // 如果还有未完成的上传，更新状态显示
                if (completedUploads < totalFiles) {
                    updateUploadStatus();
                } else {
                    // 所有文件处理完成
                    setTimeout(() => {
                        // 恢复上传区域
                        placeholder.style.pointerEvents = 'auto';
                        placeholder.style.opacity = '1';
                        placeholder.innerHTML = originalContent;
                        fileInput.disabled = false;

                        if (uploadedItemImages.length > 0) {
                            showNotification(`成功上传 ${uploadedItemImages.length} 张图片`, 'success');
                        }
                    }, 500);
                }
            }

            // 初始显示
            updateUploadStatus();

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    showNotification('请选择图片文件', 'error');
                    completedUploads++;
                    updateProgress();
                    continue;
                }

                if (file.size > 20 * 1024 * 1024) {
                    showNotification('图片大小不能超过20MB', 'error');
                    completedUploads++;
                    updateProgress();
                    continue;
                }

                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (data.code === 200 && data.data) {
                        const imageUrl = typeof data.data === 'string' ? data.data : data.data.url;
                        uploadedItemImages.push(imageUrl);
                        updateUploadedImages();
                    } else {
                        showNotification('图片上传失败', 'error');
                    }
                } catch (error) {
                    console.error('图片上传错误:', error);
                    showNotification('图片上传失败，请重试', 'error');
                }

                completedUploads++;
                updateProgress();
            }



            // 清空文件输入
            event.target.value = '';
        }

        // 更新已上传图片显示
        function updateUploadedImages() {
            const container = document.getElementById('uploaded-images');
            const placeholder = container.parentElement.querySelector('.upload-placeholder');

            if (uploadedItemImages.length > 0) {
                // 显示已上传图片，隐藏上传占位符
                placeholder.style.display = 'none';
                container.style.display = 'flex';
                container.innerHTML = uploadedItemImages.map((url, index) => `
                    <div class="uploaded-image ${index === 0 ? 'cover' : ''}">
                        <img src="${url}" alt="商品图片">
                        ${index === 0 ? '<div class="cover-badge">封面</div>' : ''}
                        <button class="remove-btn" onclick="removeItemImage(${index})">&times;</button>
                    </div>
                `).join('');

                // 如果还没达到最大数量，显示添加更多按钮
                if (uploadedItemImages.length < 5) {
                    container.innerHTML += `
                        <div class="add-more-image" onclick="document.getElementById('item-images').click()">
                            <i class="fas fa-plus"></i>
                            <span>添加图片</span>
                        </div>
                    `;
                }
            } else {
                // 没有图片时显示上传占位符
                placeholder.style.display = 'block';
                container.style.display = 'none';
                container.innerHTML = '';
            }
        }

        // 移除商品图片
        function removeItemImage(index) {
            uploadedItemImages.splice(index, 1);
            updateUploadedImages();
        }

        // 预览商品
        function previewItem() {
            const title = document.getElementById('item-title').value.trim();
            const price = parseInt(document.getElementById('item-price').value);
            const server = document.getElementById('item-server').value.trim();
            const contact = document.getElementById('item-contact').value.trim();
            const days = parseInt(document.getElementById('item-days').value);

            // 收集所有缺失的字段
            const missingFields = [];

            if (!title) missingFields.push('商品标题');
            if (!price || price <= 0) missingFields.push('商品价格');
            if (selectedItemTypes.length === 0) missingFields.push('商品标签');
            if (!server) missingFields.push('区服信息');
            if (!contact) missingFields.push('联系方式');
            if (uploadedItemImages.length === 0) missingFields.push('商品图片');
            if (!days || days <= 0) missingFields.push('上架天数');

            // 如果有缺失字段，显示友好的提示
            if (missingFields.length > 0) {
                const message = `请完善以下信息：${missingFields.join('、')}`;
                showNotification(message, 'error');
                return;
            }

            // 检查火币是否足够
            const totalFee = days * globalDailyFee;
            if (currentUser && currentUser.coins < totalFee) {
                showNotification(`火币不足，需要 ${totalFee} 火币`, 'error');
                return;
            }

            // 隐藏上架模态框（不清空数据）
            const uploadModal = document.getElementById('upload-item-modal');
            uploadModal.style.display = 'none';

            // 显示预览模态框
            const previewModal = document.getElementById('preview-item-modal');
            const previewCard = document.getElementById('preview-item-card');

            const typeTagsHtml = selectedItemTypes.map(type =>
                `<span class="mall-item-type">${type}</span>`
            ).join('');

            previewCard.innerHTML = `
                <div class="mall-item">
                    <img src="${uploadedItemImages[0]}" alt="${title}" class="mall-item-image">
                    <div class="mall-item-content">
                        <h3 class="mall-item-title">${title}</h3>
                        <div class="mall-item-details">
                            <div class="mall-item-row mall-item-price-row">
                                <span class="mall-item-price">¥${(price / 100).toFixed(2)}</span>
                                <div class="mall-item-types">${typeTagsHtml}</div>
                            </div>
                            <div class="mall-item-row mall-item-info-row">
                                <span class="mall-item-server-info">区服：${server}</span>
                                <span class="mall-item-contact-info">联系方式：${contact}</span>
                            </div>
                            <div class="mall-item-row mall-item-user-row">
                                <span class="mall-item-user">发布者：${currentUser ? currentUser.nickname : '未知'}</span>
                                <span class="mall-item-time">上架天数：${days}天</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            previewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 关闭商品预览模态框
        function closePreviewItemModal() {
            const modal = document.getElementById('preview-item-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 返回编辑商品
        function returnToEditItem() {
            // 关闭预览模态框
            closePreviewItemModal();
            // 显示编辑模态框（数据已保留）
            const uploadModal = document.getElementById('upload-item-modal');
            uploadModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // 发布商品
        async function publishItem() {
            const title = document.getElementById('item-title').value.trim();
            const price = parseInt(document.getElementById('item-price').value);
            const server = document.getElementById('item-server').value.trim();
            const contact = document.getElementById('item-contact').value.trim();
            const days = parseInt(document.getElementById('item-days').value);

            if (!title || !price || selectedItemTypes.length === 0 || !server || !contact || uploadedItemImages.length === 0 || !days) {
                showNotification('请填写完整信息', 'error');
                return;
            }

            try {
                const response = await fetch('/api/mall/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        title: title,
                        price: price,
                        types: selectedItemTypes,
                        server: server,
                        contact: contact,
                        images: uploadedItemImages,
                        days: days
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showSuccessBubble('上传成功，正在提交管理员审核！');
                    closePreviewItemModal();

                    // 清空表单
                    document.getElementById('item-title').value = '';
                    document.getElementById('item-price').value = '';
                    document.getElementById('item-server').value = '';
                    document.getElementById('item-contact').value = '';
                    document.getElementById('item-days').value = '7';
                    document.getElementById('item-type-input').value = '';

                    uploadedItemImages = [];
                    selectedItemTypes = [];
                    updateUploadedImages();
                    updateSelectedTypes();

                    // 更新用户火币显示
                    if (currentUser) {
                        currentUser.coins = data.remainingCoins;
                        updateUserDisplay();
                    }
                } else {
                    showNotification(data.message || '发布失败', 'error');
                }
            } catch (error) {
                console.error('发布商品错误:', error);
                showNotification('发布失败，请重试', 'error');
            }
        }

        // 更新上架商品按钮显示状态
        function updateUploadItemButton() {
            const uploadBtn = document.getElementById('uploadItemBtn');
            if (uploadBtn) {
                if (userToken) {
                    uploadBtn.style.display = 'flex';
                } else {
                    uploadBtn.style.display = 'none';
                }
            }
        }



        // 商品详情相关变量
        let currentItemDetail = null;
        let currentImageIndex = 0;
        let previousPage = 'browse'; // 记录进入商品详情前的页面

        // 显示商品详情
        async function showItemDetail(itemId, platformAccount, title) {
            try {
                // 记录当前页面作为前一个页面
                const currentActivePage = document.querySelector('.page.active');
                if (currentActivePage) {
                    previousPage = currentActivePage.id.replace('-page', '');
                }

                // 显示详情页面
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.getElementById('item-detail-page').classList.add('active');

                // 显示加载状态
                document.getElementById('item-detail-title').textContent = '加载中...';

                // 获取商品详情 - 优先使用ID，兼容旧的调用方式
                let apiUrl;
                if (itemId && itemId.startsWith('sp')) {
                    apiUrl = `/api/mall/item-detail?id=${encodeURIComponent(itemId)}`;
                } else {
                    // 兼容旧的调用方式
                    apiUrl = `/api/mall/item-detail?account=${encodeURIComponent(itemId || platformAccount)}&title=${encodeURIComponent(platformAccount || title)}`;
                }
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.success) {
                    currentItemDetail = data.item;
                    renderItemDetail(data.item);
                    // 优先使用商品ID加载评论，兼容旧方式
                    loadItemComments(platformAccount, title, data.item.id);

                    // 浏览量会在访问商品详情时自动增加
                } else {
                    showNotification(data.message || '获取商品详情失败', 'error');
                    closeItemDetail();
                }
            } catch (error) {
                console.error('获取商品详情错误:', error);
                showNotification('获取商品详情失败，请重试', 'error');
                closeItemDetail();
            }
        }



        // 渲染商品详情
        function renderItemDetail(item) {
            // 设置标题
            document.getElementById('item-detail-title').textContent = item.title;

            // 设置价格
            document.getElementById('item-detail-price').textContent = `¥${(item.price / 100).toFixed(2)}`;

            // 设置类型
            const typesContainer = document.getElementById('item-detail-types');
            if (item.types && item.types.length > 0) {
                typesContainer.innerHTML = item.types.map(type =>
                    `<span class="mall-item-type">${type}</span>`
                ).join('');
            } else {
                typesContainer.innerHTML = `<span class="mall-item-type">${item.type}</span>`;
            }

            // 设置商品信息
            document.getElementById('item-detail-server').textContent = item.server;
            document.getElementById('item-detail-contact').textContent = item.contact;
            document.getElementById('item-detail-seller').textContent = item.nickname;
            document.getElementById('item-detail-time').textContent = formatDateTime(item.expireTime);

            // 设置浏览量
            const viewCountElement = document.getElementById('item-detail-views');
            if (viewCountElement) {
                viewCountElement.textContent = item.viewCount || 0;
            }

            // 设置图片轮播
            setupImageSlider(item.images || [item.image]);

            // 显示评论输入框（如果用户已登录）
            const commentInputSection = document.getElementById('comment-input-section');
            if (userToken) {
                commentInputSection.style.display = 'block';
            } else {
                commentInputSection.style.display = 'none';
            }
        }

        // 设置图片轮播
        function setupImageSlider(images) {
            const slider = document.getElementById('item-images-slider');
            const indicators = document.getElementById('image-indicators');

            currentImageIndex = 0;

            // 渲染图片
            slider.innerHTML = images.map((image, index) => `
                <div class="item-image-slide">
                    <img src="${image}" alt="商品图片${index + 1}" onclick="openMallImageModal('${image}', '商品图片${index + 1}')" style="cursor: pointer;">
                </div>
            `).join('');

            // 渲染指示器
            if (images.length > 1) {
                indicators.innerHTML = images.map((_, index) => `
                    <div class="image-indicator ${index === 0 ? 'active' : ''}" onclick="goToImage(${index})"></div>
                `).join('');
                indicators.style.display = 'flex';
            } else {
                indicators.style.display = 'none';
            }

            // 添加滑动事件监听
            if (images.length > 1) {
                slider.addEventListener('scroll', updateImageIndicators);
            }
        }

        // 跳转到指定图片
        function goToImage(index) {
            const slider = document.getElementById('item-images-slider');
            const slideWidth = slider.clientWidth;
            slider.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            });
        }

        // 更新图片指示器
        function updateImageIndicators() {
            const slider = document.getElementById('item-images-slider');
            const slideWidth = slider.clientWidth;
            const newIndex = Math.round(slider.scrollLeft / slideWidth);

            if (newIndex !== currentImageIndex) {
                currentImageIndex = newIndex;

                document.querySelectorAll('.image-indicator').forEach((indicator, index) => {
                    if (index === currentImageIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        }

        // 关闭商品详情页面
        function closeItemDetail() {
            // 返回到之前的页面
            showPage(previousPage);
            currentItemDetail = null;
        }

        // 加载商品评论
        async function loadItemComments(platformAccount, title, itemId = null) {
            try {
                let apiUrl;
                if (itemId) {
                    // 优先使用商品ID
                    apiUrl = `/api/mall/comments?itemId=${encodeURIComponent(itemId)}`;
                } else {
                    // 兼容旧的方式
                    apiUrl = `/api/mall/comments?account=${encodeURIComponent(platformAccount)}&title=${encodeURIComponent(title)}`;
                }

                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    renderComments(data.comments);
                    updateCommentsCount(data.comments.length);
                } else {
                    console.error('加载评论失败:', data.message);
                    renderComments([]);
                    updateCommentsCount(0);
                }
            } catch (error) {
                console.error('加载评论错误:', error);
                renderComments([]);
                updateCommentsCount(0);
            }
        }

        // 渲染评论列表
        function renderComments(comments) {
            const commentsList = document.getElementById('comments-list');

            if (comments.length === 0) {
                commentsList.innerHTML = `
                    <div class="placeholder">
                        <i class="fas fa-comments"></i>
                        <p>暂无评论，快来发表第一条评论吧！</p>
                    </div>
                `;
                return;
            }

            commentsList.innerHTML = comments.map(comment => {
                const isAuthor = comment.isAuthor; // 使用后端返回的isAuthor字段
                const canDelete = comment.canDelete; // 使用后端返回的canDelete字段

                console.log(`前端评论渲染 - ID: ${comment.id}, 昵称: ${comment.nickname}, isAuthor: ${isAuthor}, canDelete: ${canDelete}`);

                return `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-avatar">
                            ${comment.avatar ?
                                `<img src="${comment.avatar}" alt="${comment.nickname}" onerror="this.style.display='none'; this.parentNode.innerHTML='${comment.nickname.charAt(0).toUpperCase()}';">` :
                                comment.nickname.charAt(0).toUpperCase()
                            }
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author ${isAuthor ? 'author-badge' : ''}">${comment.nickname}</span>
                            </div>
                            <div class="comment-text" style="user-select: text; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text;">${comment.content}</div>
                            <div class="comment-footer">
                                ${canDelete ? `
                                    <div class="comment-actions">
                                        <span class="comment-action" onclick="deleteComment('${comment.id}')">删除</span>
                                    </div>
                                ` : '<div></div>'}
                                <span class="comment-time">${formatDateTime(comment.createTime)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 更新评论数量
        function updateCommentsCount(count) {
            const countElement = document.getElementById('comments-count');
            countElement.textContent = `${count}条评论`;
        }

        // 提交评论
        async function submitComment() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            if (!currentItemDetail) {
                showNotification('商品信息错误', 'error');
                return;
            }

            const commentInput = document.getElementById('comment-input');
            const content = commentInput.value.trim();

            if (!content) {
                showNotification('请输入评论内容', 'error');
                return;
            }

            if (content.length > 200) {
                showNotification('评论内容不能超过200字符', 'error');
                return;
            }

            try {
                const response = await fetch('/api/mall/comment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        content: content,
                        itemId: currentItemDetail.id
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('评论发表成功', 'success');
                    commentInput.value = '';
                    // 重新加载评论，优先使用商品ID
                    loadItemComments(currentItemDetail.platformAccount, currentItemDetail.title, currentItemDetail.id);
                } else {
                    showNotification(data.message || '发表评论失败', 'error');
                }
            } catch (error) {
                console.error('发表评论错误:', error);
                showNotification('发表评论失败，请重试', 'error');
            }
        }

        // 删除评论
        async function deleteComment(commentId) {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            if (!confirm('确定要删除这条评论吗？')) {
                return;
            }

            try {
                const response = await fetch('/api/mall/comment', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        commentId: commentId
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        showNotification('评论删除成功', 'success');
                        // 重新加载评论
                        if (currentItemDetail) {
                            loadItemComments(currentItemDetail.platformAccount, currentItemDetail.title, currentItemDetail.id);
                        }
                    } else {
                        showNotification(data.message || '删除评论失败', 'error');
                    }
                } else {
                    const data = await response.json();
                    showNotification(data.message || '删除评论失败', 'error');
                }
            } catch (error) {
                console.error('删除评论错误:', error);
                showNotification('删除评论失败，请重试', 'error');
            }
        }

        // 从token获取用户名
        function getUsernameFromToken() {
            if (!userToken || !currentUser) return null;
            return currentUser.account;
        }

        // 显示用户消息页面
        async function showUserMessages() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            // 显示消息页面
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('user-messages-page').classList.add('active');

            // 加载消息
            await loadUserMessages();
        }

        // 加载用户消息
        let currentMessagesPage = 1;
        let allMessages = [];
        async function loadUserMessages(page = 1, append = false) {
            try {
                const response = await fetch(`/api/user/messages?page=${page}&limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (append) {
                        allMessages = allMessages.concat(data.messages);
                    } else {
                        allMessages = data.messages;
                        currentMessagesPage = 1;
                    }
                    renderUserMessages(allMessages, data.hasMore);
                    updateMessageBadge(data.unreadCount);
                } else {
                    console.error('加载消息失败:', data.message);
                    renderUserMessages([]);
                }
            } catch (error) {
                console.error('加载消息错误:', error);
                renderUserMessages([]);
            }
        }

        // 渲染用户消息
        function renderUserMessages(messages, hasMore = false) {
            const container = document.getElementById('messages-container');

            if (messages.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>暂无消息</h3>
                        <p>您还没有收到任何消息</p>
                    </div>
                `;
                return;
            }

            let html = messages.map(message => `
                <div class="message-item ${message.read ? 'read' : 'unread'}" onclick="markMessageAsRead('${message.id}')">
                    <div class="message-header">
                        <div class="message-time">${formatDateTime(message.time)}</div>
                    </div>
                    <div class="message-content">${escapeHtml(message.content)}</div>
                </div>
            `).join('');

            // 如果消息数量超过20条且还有更多数据，显示查看更多按钮
            if (messages.length > 20 && hasMore) {
                html += `
                    <div class="load-more-container">
                        <button class="load-more-btn" onclick="loadMoreMessages()">查看更多</button>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        // 加载更多消息
        async function loadMoreMessages() {
            currentMessagesPage++;
            await loadUserMessages(currentMessagesPage, true);
        }

        // 标记消息为已读
        async function markMessageAsRead(messageId) {
            try {
                const response = await fetch('/api/user/message/read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ messageId })
                });

                const data = await response.json();

                if (data.success) {
                    // 重新加载消息
                    loadUserMessages();
                }
            } catch (error) {
                console.error('标记消息已读错误:', error);
            }
        }

        // 标记所有消息为已读
        async function markAllMessagesAsRead() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            try {
                const response = await fetch('/api/user/messages/read-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // 更新消息徽章
                    updateMessageBadge(0);
                    // 重新加载消息以更新显示状态
                    await loadUserMessages();
                    showNotification('所有消息已标记为已读', 'success');
                } else {
                    showNotification(data.message || '操作失败', 'error');
                }
            } catch (error) {
                console.error('标记所有消息已读错误:', error);
                showNotification('网络错误，请稍后重试', 'error');
            }
        }

        // 检查未读消息数量
        async function checkUnreadMessages() {
            if (!userToken) return;

            try {
                const response = await fetch('/api/user/messages/unread-count', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    updateMessageBadge(data.unreadCount);
                }
            } catch (error) {
                console.error('检查未读消息错误:', error);
            }
        }

        // 更新消息徽章
        function updateMessageBadge(unreadCount) {
            const badge = document.getElementById('message-badge');
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }


        // 加载消息徽章
        async function loadMessageBadge() {
            if (!userToken) return;

            try {
                const response = await fetch('/api/user/messages', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    updateMessageBadge(data.unreadCount);
                }
            } catch (error) {
                console.error('加载消息徽章错误:', error);
            }
        }

        // 显示我的攻略页面
        async function showMyGuides() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            // 显示攻略页面
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('my-guides-page').classList.add('active');

            // 加载攻略
            await loadMyGuides();
        }

        // 加载我的攻略
        async function loadMyGuides() {
            try {
                const response = await fetch('/api/user/my-guides', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    renderMyGuides(data.guides);
                } else {
                    console.error('加载攻略失败:', data.message);
                    renderMyGuides([]);
                }
            } catch (error) {
                console.error('加载攻略错误:', error);
                renderMyGuides([]);
            }
        }

        // 渲染我的攻略
        function renderMyGuides(guides) {
            const container = document.getElementById('my-guides-container');

            if (guides.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>暂无攻略</h3>
                        <p>您还没有发布任何攻略</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = guides.map(guide => {
                let statusClass = 'status-pending';
                let statusText = '待审核';

                if (guide.status === 'approved') {
                    statusClass = 'status-approved';
                    statusText = '已通过';
                } else if (guide.status === 'rejected') {
                    statusClass = 'status-rejected';
                    statusText = '已拒绝';
                }

                return `
                    <div class="my-content-item">
                        <div class="content-header">
                            <h3 class="content-title">${guide.title}</h3>
                            <span class="content-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="content-info">
                            <div><strong>提交时间:</strong> ${formatDateTime(guide.createTime)}</div>
                            ${guide.approveTime ? `<div><strong>审核时间:</strong> ${formatDateTime(guide.approveTime)}</div>` : ''}
                            ${guide.rejectReason ? `<div><strong>拒绝原因:</strong> ${guide.rejectReason}</div>` : ''}
                        </div>
                        <div class="content-actions">
                            <button class="content-btn btn-primary" onclick="previewMyGuide('${guide.id}')">预览</button>
                            ${guide.status === 'pending' ? `<button class="content-btn btn-danger" onclick="deleteMyGuide('${guide.id}')">删除</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 显示我的商品页面
        async function showMyItems() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            // 显示商品页面
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('my-items-page').classList.add('active');

            // 加载商品
            await loadMyItems();
        }

        // 加载我的商品
        async function loadMyItems() {
            try {
                const response = await fetch('/api/user/my-items', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    renderMyItems(data.items);
                } else {
                    console.error('加载商品失败:', data.message);
                    renderMyItems([]);
                }
            } catch (error) {
                console.error('加载商品错误:', error);
                renderMyItems([]);
            }
        }

        // 渲染我的商品
        function renderMyItems(items) {
            const container = document.getElementById('my-items-container');

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-store"></i>
                        <h3>暂无商品</h3>
                        <p>您还没有上架任何商品</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = items.map(item => {
                let statusClass = 'status-pending';
                let statusText = '待审核';

                if (item.status === 'active') {
                    // 检查是否过期 - 使用UTC时间比较
                    const expireTime = new Date(item.expireTime);
                    const now = new Date();

                    if (expireTime <= now) {
                        statusClass = 'status-expired';
                        statusText = '已过期';
                    } else {
                        statusClass = 'status-approved';
                        statusText = '上架中';
                    }
                } else if (item.status === 'expired') {
                    statusClass = 'status-expired';
                    statusText = '已过期';
                } else if (item.status === 'rejected') {
                    statusClass = 'status-rejected';
                    statusText = '已拒绝';
                } else if (item.status === 'pending') {
                    statusClass = 'status-pending';
                    statusText = '待审核';
                }

                const isExpired = (item.status === 'active' && new Date(item.expireTime) <= new Date()) || item.status === 'expired';
                const isActive = item.status === 'active' && !isExpired;
                const canExtend = item.status === 'active' || item.status === 'expired'; // 上架中和已过期的商品都可以续时
                const canDelete = true; // 所有状态的商品都可以删除

                return `
                    <div class="my-content-item">
                        <div class="content-header">
                            <h3 class="content-title">${item.title}</h3>
                            <span class="content-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="content-info">
                            <div><strong>价格:</strong> ¥${(item.price / 100).toFixed(2)}</div>
                            <div><strong>标签:</strong> ${item.types.join(', ')}</div>
                            <div><strong>区服:</strong> ${item.server}</div>
                            <div><strong>上架时间:</strong> ${formatDateTime(item.createTime)}</div>
                            ${item.approveTime ? `<div><strong>审核时间:</strong> ${formatDateTime(item.approveTime)}</div>` : ''}
                            ${item.rejectTime ? `<div><strong>拒绝时间:</strong> ${formatDateTime(item.rejectTime)}</div>` : ''}
                            ${item.expireTime && (item.status === 'active' || item.status === 'expired') ? `<div><strong>到期时间:</strong> ${formatDateTime(item.expireTime)}</div>` : ''}
                            ${item.rejectReason ? `<div><strong>拒绝原因:</strong> ${item.rejectReason}</div>` : ''}
                        </div>
                        <div class="content-actions">
                            <button class="content-btn btn-primary" onclick="previewMyItem('${item.id}')">预览</button>
                            ${canExtend ? `<button class="content-btn btn-success" onclick="showExtendModal('${item.id}', '${item.title}')">续时</button>` : ''}
                            ${canDelete ? `<button class="content-btn btn-danger" onclick="deleteMyItem('${item.id}')">删除</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 预览我的攻略
        async function previewMyGuide(guideId) {
            try {
                // 从当前加载的攻略列表中查找攻略
                const response = await fetch('/api/user/my-guides', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();
                if (!data.success) {
                    showNotification('获取攻略信息失败', 'error');
                    return;
                }

                const guide = data.guides.find(g => g.id == guideId);
                if (!guide) {
                    showNotification('攻略不存在', 'error');
                    return;
                }

                // 显示预览模态框
                const previewModal = document.getElementById('my-guide-preview-modal');
                const previewContent = document.getElementById('my-guide-preview-content');

                const statusText = getGuideStatusText(guide.status);
                const statusClass = getGuideStatusClass(guide.status);

                // 处理攻略内容中的图片
                const processedContent = guide.content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;">');

                previewContent.innerHTML = `
                    <div class="guide-preview-header">
                        <h2 class="guide-preview-title">${guide.title}</h2>
                        <div class="guide-preview-meta">
                            <div class="guide-preview-status">
                                <span class="status-${statusClass}">${statusText}</span>
                            </div>
                            <div class="guide-preview-info">
                                <span><i class="fas fa-user"></i> ${guide.authorNickname}</span>
                                <span><i class="fas fa-calendar"></i> ${formatDateTime(guide.createTime)}</span>
                                ${guide.approveTime ? `<span><i class="fas fa-check"></i> ${formatDateTime(guide.approveTime)}</span>` : ''}
                            </div>
                            ${guide.rejectReason ? `<div class="guide-preview-reject"><strong>拒绝原因:</strong> ${guide.rejectReason}</div>` : ''}
                        </div>
                    </div>
                    <div class="guide-preview-content">
                        ${processedContent.replace(/\n/g, '<br>')}
                    </div>
                `;

                previewModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('预览攻略错误:', error);
                showNotification('预览失败，请重试', 'error');
            }
        }

        // 关闭我的攻略预览模态框
        function closeMyGuidePreviewModal() {
            const modal = document.getElementById('my-guide-preview-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 获取攻略状态文本
        function getGuideStatusText(status) {
            switch (status) {
                case 'pending': return '待审核';
                case 'approved': return '已通过';
                case 'rejected': return '已拒绝';
                default: return '未知';
            }
        }

        // 获取攻略状态样式类
        function getGuideStatusClass(status) {
            switch (status) {
                case 'pending': return 'pending';
                case 'approved': return 'approved';
                case 'rejected': return 'rejected';
                default: return 'unknown';
            }
        }

        // 删除我的攻略
        async function deleteMyGuide(guideId) {
            if (!confirm('确定要删除这个攻略吗？删除后无法恢复。')) return;

            try {
                const response = await fetch('/api/user/delete-guide', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ guideId })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('攻略删除成功', 'success');
                    loadMyGuides();
                } else {
                    showNotification(data.message || '删除失败', 'error');
                }
            } catch (error) {
                console.error('删除攻略错误:', error);
                showNotification('删除失败，请重试', 'error');
            }
        }

        // 显示妖火通知页面
        async function showYaohuoNotices() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            // 显示通知页面
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('yaohuo-notices-page').classList.add('active');

            // 加载通知
            await loadYaohuoNotices();
        }

        // 加载妖火通知
        let currentNoticesPage = 1;
        let allNotices = [];
        async function loadYaohuoNotices(page = 1, append = false) {
            try {
                const response = await fetch(`/api/user/notices?page=${page}&limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (append) {
                        allNotices = allNotices.concat(data.notices);
                    } else {
                        allNotices = data.notices;
                        currentNoticesPage = 1;
                    }
                    renderYaohuoNotices(allNotices, data.hasMore);
                    updateNoticeBadge(data.unreadCount);
                } else {
                    console.error('加载通知失败:', data.message);
                    renderYaohuoNotices([]);
                }
            } catch (error) {
                console.error('加载通知错误:', error);
                renderYaohuoNotices([]);
            }
        }

        // 渲染妖火通知
        function renderYaohuoNotices(notices, hasMore = false) {
            const container = document.getElementById('notices-container');

            if (notices.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bell"></i>
                        <h3>暂无通知</h3>
                        <p>您还没有收到任何妖火通知</p>
                    </div>
                `;
                return;
            }

            let html = notices.map(notice => `
                <div class="message-item ${notice.read ? 'read' : 'unread'}" onclick="markNoticeAsRead('${notice.id}')">
                    <div class="message-header">
                        <div class="message-time">${formatDateTime(notice.time)}</div>
                    </div>
                    <div class="message-content">${escapeHtml(notice.content)}</div>
                </div>
            `).join('');

            // 如果通知数量超过20条且还有更多数据，显示查看更多按钮
            if (notices.length > 20 && hasMore) {
                html += `
                    <div class="load-more-container">
                        <button class="load-more-btn" onclick="loadMoreNotices()">查看更多</button>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        // 加载更多通知
        async function loadMoreNotices() {
            currentNoticesPage++;
            await loadYaohuoNotices(currentNoticesPage, true);
        }

        // 标记通知为已读
        async function markNoticeAsRead(noticeId) {
            try {
                const response = await fetch('/api/user/notice/read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ noticeId })
                });

                const data = await response.json();

                if (data.success) {
                    // 重新加载通知
                    loadYaohuoNotices();
                }
            } catch (error) {
                console.error('标记通知已读错误:', error);
            }
        }

        // 标记所有通知为已读
        async function markAllNoticesAsRead() {
            try {
                const response = await fetch('/api/user/notices/read-all', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // 更新通知徽章
                    updateNoticeBadge(0);
                    // 重新加载通知以更新显示状态
                    await loadYaohuoNotices();
                    showNotification('所有通知已标记为已读', 'success');
                } else {
                    showNotification(data.message || '操作失败', 'error');
                }
            } catch (error) {
                console.error('标记所有通知已读错误:', error);
                showNotification('操作失败，请重试', 'error');
            }
        }

        // 更新通知徽章
        function updateNoticeBadge(count) {
            const badge = document.getElementById('notice-badge');
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }

        // 加载通知徽章
        async function loadNoticeBadge() {
            if (!userToken) return;

            try {
                const response = await fetch('/api/user/notices/unread-count', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    updateNoticeBadge(data.unreadCount);
                }
            } catch (error) {
                console.error('加载通知徽章错误:', error);
            }
        }

        // 预览我的商品
        async function previewMyItem(itemId) {
            try {
                // 从当前加载的商品列表中查找商品
                const response = await fetch('/api/user/my-items', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();
                if (!data.success) {
                    showNotification('获取商品信息失败', 'error');
                    return;
                }

                const item = data.items.find(i => i.id === itemId);
                if (!item) {
                    showNotification('商品不存在', 'error');
                    return;
                }

                // 显示预览模态框
                const previewModal = document.getElementById('my-item-preview-modal');
                const previewCard = document.getElementById('my-item-preview-card');

                const typeTagsHtml = item.types.map(type =>
                    `<span class="mall-item-type">${type}</span>`
                ).join('');

                const statusText = getItemStatusText(item.status);
                const statusClass = getItemStatusClass(item.status);

                previewCard.innerHTML = `
                    <div class="mall-item">
                        <div class="mall-item-images">
                            <div class="mall-item-image-main">
                                <img src="${item.images[0]}" alt="${item.title}">
                            </div>
                            ${item.images.length > 1 ? `
                                <div class="mall-item-image-thumbs">
                                    ${item.images.map((img, index) => `
                                        <img src="${img}" alt="图片${index + 1}" onclick="switchPreviewImage('${img}')">
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="mall-item-info">
                            <h3 class="mall-item-title">${item.title}</h3>
                            <div class="mall-item-price">¥${(item.price / 100).toFixed(2)}</div>
                            <div class="mall-item-types">${typeTagsHtml}</div>
                            <div class="mall-item-details">
                                <div><strong>区服:</strong> ${item.server}</div>
                                <div><strong>联系方式:</strong> ${item.contact}</div>
                                <div><strong>状态:</strong> <span class="status-${statusClass}">${statusText}</span></div>
                                <div><strong>上架天数:</strong> ${item.days}天</div>
                                <div><strong>费用:</strong> ${item.totalFee}火币</div>
                                ${item.rejectReason ? `<div><strong>拒绝原因:</strong> ${item.rejectReason}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;

                previewModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('预览商品错误:', error);
                showNotification('预览失败，请重试', 'error');
            }
        }

        // 切换预览图片
        function switchPreviewImage(imageUrl) {
            const mainImage = document.querySelector('#my-item-preview-card .mall-item-image-main img');
            if (mainImage) {
                mainImage.src = imageUrl;
            }
        }

        // 关闭我的商品预览模态框
        function closeMyItemPreviewModal() {
            const modal = document.getElementById('my-item-preview-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 获取商品状态文本
        function getItemStatusText(status) {
            switch (status) {
                case 'pending': return '待审核';
                case 'active': return '已上架';
                case 'expired': return '已过期';
                case 'rejected': return '已拒绝';
                default: return '未知';
            }
        }

        // 获取商品状态样式类
        function getItemStatusClass(status) {
            switch (status) {
                case 'pending': return 'pending';
                case 'active': return 'active';
                case 'expired': return 'expired';
                case 'rejected': return 'rejected';
                default: return 'unknown';
            }
        }

        // 重新上架商品
        async function relistItem(itemId) {
            const days = prompt('请输入重新上架天数:', '7');
            if (!days || isNaN(days) || days <= 0) {
                showNotification('请输入有效的天数', 'error');
                return;
            }

            const listingFee = getListingFee();
            const totalFee = parseInt(days) * listingFee;

            if (!confirm(`重新上架${days}天需要${totalFee}火币，确定继续吗？`)) return;

            try {
                const response = await fetch('/api/user/relist-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ itemId, days: parseInt(days) })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('商品重新上架成功', 'success');
                    loadMyItems();
                } else {
                    showNotification(data.message || '重新上架失败', 'error');
                }
            } catch (error) {
                console.error('重新上架错误:', error);
                showNotification('重新上架失败，请重试', 'error');
            }
        }

        // 删除我的商品
        async function deleteMyItem(itemId) {
            try {
                // 先获取商品信息以确定状态
                const response = await fetch('/api/user/my-items', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();
                if (!data.success) {
                    showNotification('获取商品信息失败', 'error');
                    return;
                }

                const item = data.items.find(i => i.id === itemId);
                if (!item) {
                    showNotification('商品不存在', 'error');
                    return;
                }

                // 确认删除
                const confirmMessage = '确定要删除这个商品吗？删除后无法恢复，且不退还火币。';
                if (!confirm(confirmMessage)) return;

                const deleteResponse = await fetch('/api/user/delete-item', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ itemId })
                });

                const deleteData = await deleteResponse.json();

                if (deleteData.success) {
                    showNotification('商品删除成功', 'success');
                    // 立即刷新商品列表
                    loadMyItems();
                } else {
                    showNotification(deleteData.message || '删除失败', 'error');
                }
            } catch (error) {
                console.error('删除商品错误:', error);
                showNotification('删除失败，请重试', 'error');
            }
        }

        // 切换结果展开/收起
        function toggleResult(index, guideId) {
            const resultItem = document.getElementById(`result-${index}`);
            const content = document.getElementById(`content-${index}`);
            const fileContent = document.getElementById(`file-content-${index}`);

            if (content && resultItem) {
                if (content.classList.contains('expanded')) {
                    content.classList.remove('expanded');
                    resultItem.classList.remove('expanded');
                } else {
                    content.classList.add('expanded');
                    resultItem.classList.add('expanded');

                    // 如果内容还没有加载，则加载内容
                    if (guideId && fileContent && fileContent.innerHTML.includes('点击标题展开查看详细内容')) {
                        fileContent.innerHTML = `
                            <div style="text-align: center; padding: 20px; color: #7f8c8d;">
                                <i class="fas fa-spinner fa-spin"></i> 加载中...
                            </div>
                        `;
                        loadGuideContent(guideId, index);
                    }
                }
            }
        }

        // 从后端加载攻略内容
        function loadGuideContent(guideId, index) {
            fetch(`/api/guides/detail?id=${guideId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('获取攻略内容失败');
                    }
                    return response.json();
                })
                .then(data => {
                    const contentElement = document.getElementById(`file-content-${index}`);
                    if (contentElement) {
                        if (data.success && data.guide) {
                            const processedContent = processContent(data.guide.content, data.guide.authorNickname);
                            contentElement.innerHTML = processedContent;
                        } else {
                            contentElement.innerHTML =
                                `<div style="color: #e74c3c; text-align: center; padding: 20px;">
                                    <i class="fas fa-exclamation-circle"></i> ${data.error || '加载失败'}
                                </div>`;
                        }
                    }
                })
                .catch(error => {
                    console.error('加载攻略内容失败:', error);
                    const contentElement = document.getElementById(`file-content-${index}`);
                    if (contentElement) {
                        contentElement.innerHTML =
                            `<div style="color: #e74c3c; text-align: center; padding: 20px;">
                                <i class="fas fa-exclamation-circle"></i> 加载失败，请稍后重试
                            </div>`;
                    }
                });
        }



        // 处理内容，转换图片标签和格式化文本
        function processContent(content, author = null) {
            if (!content) return '暂无内容';

            let processedContent = content;
            let authorInfo = '';

            // 生成发布人信息
            if (author && author !== '未知用户') {
                authorInfo = `<div class="guide-author-info">— 本攻略由 <strong>${author}</strong> 编辑发布 —</div>`;
            } else {
                authorInfo = `<div class="guide-author-info">— 本攻略由 <strong>管理员</strong> 编辑发布 —</div>`;
            }

            // 使用原始内容，不需要跳过头部信息（数据库存储的是纯内容）
            const actualContent = content;

            // 转换图片标签 - 支持多种格式
            // 1. 支持 [img]url[/img] 格式
            processedContent = actualContent.replace(/\[img\](.*?)\[\/img\]/g,
                '<img src="$1" class="guide-image" onclick="openImageModal(\'$1\')" alt="攻略图片" loading="lazy">');

            // 2. 支持 Markdown 格式 ![alt](url)
            processedContent = processedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
                '<img src="$2" class="guide-image" onclick="openImageModal(\'$2\')" alt="$1" loading="lazy">');

            // 转换换行符为HTML换行
            processedContent = processedContent.replace(/\n/g, '<br>');

            // 处理空行，增加段落间距
            processedContent = processedContent.replace(/(<br>\s*){2,}/g, '<br><br>');

            // 在内容开头添加发布人信息
            return authorInfo + '<br>' + processedContent;
        }

        // 全局变量用于图片缩放
        let currentZoom = 1;
        let isDragging = false;
        let startX, startY, translateX = 0, translateY = 0;

        // 打开图片预览
        function openImageModal(src) {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const zoomInfo = document.getElementById('zoomInfo');

            if (modal && modalImage) {
                modalImage.src = src;
                modal.style.display = 'flex';

                // 防止页面滚动
                document.body.style.overflow = 'hidden';

                // 重置图片状态
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransform();
                updateZoomInfo();

                // 添加加载状态
                modalImage.onload = function() {
                    modalImage.style.opacity = '1';
                };
                modalImage.style.opacity = '0.5';

                // 初始化拖拽功能
                initImageDrag();
            }
        }

        // 缩放图片
        function zoomImage(factor) {
            const newZoom = currentZoom * factor;
            if (newZoom >= 0.5 && newZoom <= 5) {
                currentZoom = newZoom;
                updateImageTransform();
                updateZoomInfo();
                updateZoomButtons();
            }
        }

        // 重置缩放
        function resetZoom() {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            updateZoomInfo();
            updateZoomButtons();
        }

        // 更新图片变换
        function updateImageTransform() {
            const modalImage = document.getElementById('modalImage');
            if (modalImage) {
                modalImage.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
                modalImage.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';

                if (currentZoom > 1) {
                    modalImage.classList.add('zoomed');
                } else {
                    modalImage.classList.remove('zoomed');
                }
            }
        }

        // 更新缩放信息显示
        function updateZoomInfo() {
            const zoomInfo = document.getElementById('zoomInfo');
            if (zoomInfo) {
                zoomInfo.textContent = Math.round(currentZoom * 100) + '%';
            }
        }

        // 更新缩放按钮状态
        function updateZoomButtons() {
            const zoomInBtn = document.getElementById('zoomInBtn');
            const zoomOutBtn = document.getElementById('zoomOutBtn');

            if (zoomInBtn) {
                zoomInBtn.disabled = currentZoom >= 5;
            }
            if (zoomOutBtn) {
                zoomOutBtn.disabled = currentZoom <= 0.5;
            }
        }

        // 初始化图片拖拽功能
        function initImageDrag() {
            const modalImage = document.getElementById('modalImage');
            const container = document.getElementById('modalImageContainer');

            if (!modalImage || !container) return;

            // 鼠标事件
            modalImage.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);

            // 触摸事件
            modalImage.addEventListener('touchstart', startDragTouch);
            document.addEventListener('touchmove', dragTouch);
            document.addEventListener('touchend', endDrag);

            // 滚轮缩放
            container.addEventListener('wheel', handleWheel);

            // 双击缩放
            modalImage.addEventListener('dblclick', handleDoubleClick);
        }

        // 开始拖拽（鼠标）
        function startDrag(e) {
            if (currentZoom <= 1) return;
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            document.getElementById('modalImage').style.cursor = 'grabbing';
            e.preventDefault();
        }

        // 开始拖拽（触摸）
        function startDragTouch(e) {
            if (currentZoom <= 1 || e.touches.length !== 1) return;
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
            e.preventDefault();
        }

        // 拖拽中（鼠标）
        function drag(e) {
            if (!isDragging || currentZoom <= 1) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
            e.preventDefault();
        }

        // 拖拽中（触摸）
        function dragTouch(e) {
            if (!isDragging || currentZoom <= 1 || e.touches.length !== 1) return;
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateImageTransform();
            e.preventDefault();
        }

        // 结束拖拽
        function endDrag() {
            if (isDragging) {
                isDragging = false;
                const modalImage = document.getElementById('modalImage');
                if (modalImage) {
                    modalImage.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
                }
            }
        }

        // 滚轮缩放
        function handleWheel(e) {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            zoomImage(factor);
        }

        // 双击缩放
        function handleDoubleClick(e) {
            e.preventDefault();
            if (currentZoom === 1) {
                zoomImage(2);
            } else {
                resetZoom();
            }
        }

        // 关闭图片预览
        function closeImageModal() {
            const modal = document.getElementById('imageModal');
            if (modal) {
                modal.style.display = 'none';
                // 恢复页面滚动
                document.body.style.overflow = 'auto';

                // 重置图片状态
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                isDragging = false;
            }
        }

        // 图片模态框事件监听
        document.addEventListener('DOMContentLoaded', function() {
            const imageModal = document.getElementById('imageModal');
            const mallImageModal = document.getElementById('mall-image-modal');

            if (imageModal) {
                // 点击攻略图片模态框背景关闭
                imageModal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeImageModal();
                    }
                });
            }

            if (mallImageModal) {
                // 点击商城图片模态框背景关闭
                mallImageModal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeMallImageModal();
                    }
                });
            }

            // 按ESC键关闭模态框
            document.addEventListener('keydown', function(e) {
                // 检查攻略图片模态框
                const imageModal = document.getElementById('imageModal');
                const isImageModalOpen = imageModal && imageModal.style.display === 'flex';

                // 检查商城图片模态框
                const mallImageModal = document.getElementById('mall-image-modal');
                const isMallImageModalOpen = mallImageModal && mallImageModal.style.display === 'flex';

                if (e.key === 'Escape') {
                    if (isImageModalOpen) {
                        closeImageModal();
                    } else if (isMallImageModalOpen) {
                        closeMallImageModal();
                    }
                } else if (isImageModalOpen) {
                    // 攻略图片模态框的快捷键
                    if (e.key === '+' || e.key === '=') {
                        e.preventDefault();
                        zoomImage(1.2);
                    } else if (e.key === '-') {
                        e.preventDefault();
                        zoomImage(0.8);
                    } else if (e.key === '0') {
                        e.preventDefault();
                        resetZoom();
                    }
                } else if (isMallImageModalOpen) {
                    // 商城图片模态框的快捷键
                    if (e.key === '+' || e.key === '=') {
                        e.preventDefault();
                        mallImageZoomIn();
                    } else if (e.key === '-') {
                        e.preventDefault();
                        mallImageZoomOut();
                    } else if (e.key === '0') {
                        e.preventDefault();
                        mallImageResetZoom();
                    }
                }
            });
        });

        // 用户系统相关功能
        let userToken = localStorage.getItem('userToken');
        let currentUser = null;

        // 页面加载时检查登录状态
        document.addEventListener('DOMContentLoaded', function() {
            checkLoginStatus();
            loadSavedCredentials(); // 加载保存的账号密码

            // 绑定登录表单事件
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
        });

        // 加载保存的账号密码
        function loadSavedCredentials() {
            const savedUsername = localStorage.getItem('savedUsername');
            const savedPassword = localStorage.getItem('savedPassword');

            if (savedUsername) {
                const usernameInput = document.getElementById('username');
                if (usernameInput) {
                    usernameInput.value = savedUsername;
                }
            }

            if (savedPassword) {
                const passwordInput = document.getElementById('password');
                if (passwordInput) {
                    passwordInput.value = savedPassword;
                }
            }
        }

        // 保存账号密码到缓存
        function saveCredentials(username, password) {
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPassword', password);
        }

        // 清空保存的账号密码
        function clearSavedCredentials() {
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
        }

        // 检查登录状态
        async function checkLoginStatus() {
            if (!userToken) {
                showLoginForm();
                return;
            }

            try {
                const response = await fetch('/api/user/info', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        currentUser = data.user;
                        showUserProfile();
                        return;
                    }
                }
            } catch (error) {
                console.error('检查登录状态失败:', error);
            }

            // 登录失效，清除token
            localStorage.removeItem('userToken');
            userToken = null;
            showLoginForm();
        }

        // 显示登录表单
        function showLoginForm() {
            document.getElementById('login-container').style.display = 'block';
            document.getElementById('profile-container').style.display = 'none';
        }

        // 显示用户资料
        function showUserProfile() {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('profile-container').style.display = 'block';

            if (currentUser) {
                updateUserDisplay();
                updateCheckinButton();
                // 加载通知徽章
                loadNoticeBadge();
            }
        }

        // 更新用户显示信息
        function updateUserDisplay() {
            const avatarImg = document.getElementById('user-avatar-img');
            const defaultAvatar = document.getElementById('default-avatar');

            // 处理头像显示 - 检查是否有有效的头像URL
            if (currentUser.avatar &&
                currentUser.avatar !== 'https://via.placeholder.com/100x100/3498db/ffffff?text=头像' &&
                currentUser.avatar.startsWith('http') &&
                !currentUser.avatar.includes('placeholder')) {

                // 尝试加载头像，如果失败则显示默认头像
                avatarImg.onload = function() {
                    avatarImg.style.display = 'block';
                    defaultAvatar.style.display = 'none';
                };

                avatarImg.onerror = function() {
                    avatarImg.style.display = 'none';
                    defaultAvatar.style.display = 'flex';
                };

                avatarImg.src = currentUser.avatar;
            } else {
                avatarImg.style.display = 'none';
                defaultAvatar.style.display = 'flex';
            }

            document.getElementById('user-nickname').textContent =
                currentUser.nickname === '妖火用户' ? '尊贵的妖火用户' : currentUser.nickname;
            document.getElementById('user-id').textContent = currentUser.id;
            document.getElementById('user-coins').textContent = currentUser.coins;
            document.getElementById('consecutive-days').textContent = currentUser.consecutive_days + '天';
        }

        // 更新签到按钮状态
        function updateCheckinButton() {
            const checkinBtn = document.getElementById('checkin-btn');
            // 使用北京时间
            const now = new Date();
            const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
            const today = beijingTime.toISOString().split('T')[0];
            let lastCheckin = '';
            if (currentUser.last_checkin) {
                if (typeof currentUser.last_checkin === 'string') {
                    // 处理字符串格式的时间，提取日期部分
                    lastCheckin = currentUser.last_checkin.split('T')[0].split(' ')[0];
                } else if (currentUser.last_checkin instanceof Date) {
                    // 处理Date对象，转换为北京时间
                    const beijingTime = new Date(currentUser.last_checkin.getTime() + (8 * 60 * 60 * 1000));
                    lastCheckin = beijingTime.toISOString().split('T')[0];
                }
            }

            console.log('签到按钮检查:', {
                today: today,
                lastCheckin: lastCheckin,
                lastCheckinRaw: currentUser.last_checkin,
                isEqual: lastCheckin === today
            });

            // 签到按钮永远显示
            checkinBtn.style.display = 'flex';

            if (lastCheckin === today) {
                checkinBtn.disabled = true;
                checkinBtn.innerHTML = `<i class="fas fa-check"></i><span class="checkin-text">签到</span>`;
                checkinBtn.title = `已连续签到${currentUser.consecutive_days}天`;
            } else {
                checkinBtn.disabled = false;
                checkinBtn.innerHTML = '<i class="fas fa-gift"></i><span class="checkin-text">签到</span>';
                checkinBtn.title = '每日签到';
            }
        }

        // 处理登录
        async function handleLogin(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showNotification('请输入用户名和密码', 'error');
                return;
            }

            // 显示登录中状态
            const loginBtn = document.querySelector('.modern-login-btn');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
            loginBtn.disabled = true;

            try {
                const response = await fetch('/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    userToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('userToken', userToken);

                    // 登录成功后保存账号密码
                    saveCredentials(username, password);

                    showNotification('登录成功', 'success');
                    setTimeout(() => {
                        showUserProfile();
                        updateUploadGuideButton(); // 更新上传攻略按钮状态
                        updateUploadItemButton(); // 更新上架商品按钮状态
                        loadMessageBadge(); // 加载消息徽章
                        loadNoticeBadge(); // 加载通知徽章
                    }, 1000);
                } else {
                    // 登录失败时清空缓存的账号密码
                    clearSavedCredentials();

                    // 修改密码错误的提醒信息
                    let errorMessage = data.message || '登录失败';
                    if (errorMessage.includes('密码') || errorMessage.includes('password')) {
                        errorMessage = '暂仅支持妖火账号密码登录';
                    }

                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('登录错误:', error);
                // 网络错误时也清空缓存
                clearSavedCredentials();
                showNotification('网络错误，请稍后重试', 'error');
            } finally {
                // 恢复按钮状态
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        }

        // 每日签到
        async function dailyCheckin() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            try {
                const response = await fetch('/api/user/checkin', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(
                        `签到成功！获得 ${data.coinsEarned} 个火币，连续签到 ${data.consecutiveDays} 天`,
                        'success');

                    // 更新用户信息
                    currentUser.coins = data.totalCoins;
                    currentUser.consecutive_days = data.consecutiveDays;
                    // 设置签到时间为今天的Date对象
                    const now = new Date();
                    currentUser.last_checkin = now;

                    updateUserDisplay();
                    updateCheckinButton();
                } else {
                    showNotification(data.message || '签到失败', 'error');
                }
            } catch (error) {
                console.error('签到错误:', error);
                showNotification('网络错误，请稍后重试', 'error');
            }
        }

        // 显示退出确认弹窗
        function logout() {
            const modal = document.getElementById('logout-modal');
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        // 关闭退出确认弹窗
        function closeLogoutModal() {
            const modal = document.getElementById('logout-modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        // 确认退出登录
        async function confirmLogout() {
            closeLogoutModal();

            try {
                if (userToken) {
                    await fetch('/api/user/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`
                        }
                    });
                }
            } catch (error) {
                console.error('退出登录错误:', error);
            }

            localStorage.removeItem('userToken');
            // 退出登录时清空保存的账号密码
            clearSavedCredentials();

            userToken = null;
            currentUser = null;
            showLoginForm();

            // 清空表单
            document.getElementById('login-form').reset();
            const loginMessage = document.getElementById('login-message');
            if (loginMessage) {
                loginMessage.style.display = 'none';
            }
            const checkinMessage = document.getElementById('checkin-message');
            if (checkinMessage) {
                checkinMessage.style.display = 'none';
            }

            showNotification('已退出登录', 'success');
            updateUploadGuideButton(); // 更新上传攻略按钮状态
            updateUploadItemButton(); // 更新上架商品按钮状态
        }

        // 显示消息
        function showMessage(element, message, type) {
            element.textContent = message;
            element.className = `modern-message ${type}`;
            element.style.display = 'block';

            // 3秒后自动隐藏成功消息
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }

        // 显示通知气泡
        function showNotification(message, type = 'success') {
            // 总是创建一个新的临时气泡，确保在最顶层显示
            const bubble = document.createElement('div');
            bubble.className = 'temp-notification-bubble';
            bubble.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                z-index: 99999;
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                pointer-events: none;
                white-space: nowrap;
            `;
            bubble.textContent = message;
            document.body.appendChild(bubble);

            // 显示动画
            setTimeout(() => {
                bubble.style.opacity = '1';
                bubble.style.transform = 'translateX(-50%) translateY(0)';
            }, 50);

            // 3秒后隐藏并删除
            setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'translateX(-50%) translateY(-10px)';

                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 300);
            }, 3000);
        }

        // 显示成功气泡提醒
        function showSuccessBubble(message) {
            const bubble = document.createElement('div');
            bubble.className = 'success-bubble';
            bubble.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;

            document.body.appendChild(bubble);

            // 触发动画
            setTimeout(() => bubble.classList.add('show'), 10);

            // 自动移除
            setTimeout(() => {
                bubble.classList.remove('show');
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 300);
            }, 3000);
        }

        // 更换头像
        function changeAvatar() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            // 检查是否正在上传
            const avatar = document.querySelector('.modern-avatar');
            if (avatar.classList.contains('uploading')) {
                return;
            }

            // 创建文件输入元素
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = async function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // 检查文件大小（限制为20MB）
                if (file.size > 20 * 1024 * 1024) {
                    showNotification('图片大小不能超过20MB', 'error');
                    return;
                }

                // 显示上传状态
                const avatar = document.querySelector('.modern-avatar');
                const uploadOverlay = document.getElementById('upload-overlay');
                avatar.classList.add('uploading');
                uploadOverlay.style.display = 'flex';

                try {
                    // 使用现有的上传接口
                    const formData = new FormData();
                    formData.append('file', file);

                    const uploadResponse = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const uploadData = await uploadResponse.json();

                    if (uploadData.code === 200 && uploadData.data) {
                        // 处理返回的数据格式
                        const avatarUrl = typeof uploadData.data === 'string' ? uploadData.data : uploadData.data.url;

                        // 更新用户头像
                        const response = await fetch('/api/user/avatar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${userToken}`
                            },
                            body: JSON.stringify({ avatarUrl: avatarUrl })
                        });

                        const data = await response.json();

                        if (data.success) {
                            currentUser.avatar = avatarUrl;
                            // 使用统一的头像更新逻辑
                            updateUserDisplay();
                            showNotification('头像更新成功！', 'success');
                        } else {
                            showNotification(data.message || '头像更新失败', 'error');
                        }
                    } else {
                        showNotification('图片上传失败', 'error');
                    }
                } catch (error) {
                    console.error('更换头像错误:', error);
                    showNotification('网络错误，请稍后重试', 'error');
                } finally {
                    // 隐藏上传状态
                    const avatar = document.querySelector('.modern-avatar');
                    const uploadOverlay = document.getElementById('upload-overlay');
                    avatar.classList.remove('uploading');
                    uploadOverlay.style.display = 'none';
                }

                // 清理
                document.body.removeChild(input);
            };

            document.body.appendChild(input);
            input.click();
        }

        // 编辑昵称
        function editNickname() {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            const modal = document.getElementById('nickname-modal');
            const input = document.getElementById('nickname-input');

            // 设置当前昵称
            input.value = currentUser.nickname;

            // 显示模态框
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
                input.focus();
                input.select();
            }, 10);
        }

        // 关闭昵称编辑模态框
        function closeNicknameModal() {
            const modal = document.getElementById('nickname-modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        // 确认昵称修改
        function confirmNicknameChange() {
            const input = document.getElementById('nickname-input');
            const newNickname = input.value.trim();

            if (newNickname === '') {
                showNotification('昵称不能为空', 'error');
                return;
            }

            if (newNickname.length > 20) {
                showNotification('昵称长度不能超过20个字符', 'error');
                return;
            }

            if (newNickname === currentUser.nickname) {
                closeNicknameModal();
                return; // 没有变化
            }

            updateNickname(newNickname);
        }

        // 更新昵称
        async function updateNickname(nickname) {
            try {
                const response = await fetch('/api/user/nickname', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ nickname })
                });

                const data = await response.json();

                if (data.success) {
                    currentUser.nickname = nickname;
                    document.getElementById('user-nickname').textContent =
                        nickname === '妖火用户' ? '尊贵的妖火用户' : nickname;
                    closeNicknameModal();
                    showNotification('昵称更新成功！', 'success');
                } else {
                    showNotification(data.message || '昵称更新失败', 'error');
                }
            } catch (error) {
                console.error('更新昵称错误:', error);
                showNotification('网络错误，请稍后重试', 'error');
            }
        }

        // 添加键盘事件监听
        document.addEventListener('DOMContentLoaded', function() {
            // 昵称输入框键盘事件
            const nicknameInput = document.getElementById('nickname-input');
            if (nicknameInput) {
                nicknameInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        confirmNicknameChange();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        closeNicknameModal();
                    }
                });
            }

            // 模态框背景点击关闭
            const nicknameModal = document.getElementById('nickname-modal');
            if (nicknameModal) {
                nicknameModal.addEventListener('click', function(e) {
                    if (e.target === nicknameModal) {
                        closeNicknameModal();
                    }
                });
            }

            const logoutModal = document.getElementById('logout-modal');
            if (logoutModal) {
                logoutModal.addEventListener('click', function(e) {
                    if (e.target === logoutModal) {
                        closeLogoutModal();
                    }
                });
            }

            // 吹牛记录模态框点击外部关闭
            const bragRecordsModal = document.getElementById('brag-records-modal');
            if (bragRecordsModal) {
                bragRecordsModal.addEventListener('click', function(e) {
                    if (e.target === bragRecordsModal) {
                        closeBragRecordsModal();
                    }
                });
            }

            // 吹牛排行榜模态框点击外部关闭
            const bragRankingModal = document.getElementById('brag-ranking-modal');
            if (bragRankingModal) {
                bragRankingModal.addEventListener('click', function(e) {
                    if (e.target === bragRankingModal) {
                        closeBragRankingModal();
                    }
                });
            }
        });

        // 商城相关功能
        let mallItems = [];
        let filteredMallItems = [];
        let mallImageZoom = 1;

        // 初始化逛页面
        function initBrowsePage() {
            // 默认显示交易阁
            switchBrowseTab('mall');

            // 初始化搜索输入框事件监听
            const searchInput = document.getElementById('mall-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', toggleClearSearchButton);
            }
        }

        // 切换板块
        function switchBrowseTab(tabName) {
            // 更新导航状态
            document.querySelectorAll('.browse-nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`.browse-nav-item[onclick="switchBrowseTab('${tabName}')"]`).classList.add('active');

            // 更新内容显示
            document.querySelectorAll('.browse-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-content`).classList.add('active');

            // 如果是交易阁，加载商品数据
            if (tabName === 'mall') {
                loadMallItems();
                updateUploadItemButton(); // 更新上架商品按钮状态
            }

            // 如果是娱乐页面，刷新题目列表
            if (tabName === 'entertainment') {
                loadBragQuestions();
            }
        }

        // 加载商品数据
        async function loadMallItems() {
            const container = document.getElementById('mall-items-container');
            const loader = document.getElementById('mall-loader');

            // 每次都重新获取商品信息，不使用缓存

            try {
                if (loader) {
                    loader.style.display = 'block';
                }

                const response = await fetch('/api/mall/items');
                const data = await response.json();

                if (data.success) {
                    mallItems = data.items;
                    filteredMallItems = [...mallItems];
                    renderMallItems();
                } else {
                    throw new Error(data.message || '加载商品失败');
                }
            } catch (error) {
                console.error('加载商品失败:', error);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            加载商品失败: ${error.message}
                        </div>
                    `;
                }
            } finally {
                if (loader) {
                    loader.style.display = 'none';
                }
            }
        }

        // 渲染商品列表
        function renderMallItems() {
            const container = document.getElementById('mall-items-container');

            if (filteredMallItems.length === 0) {
                container.innerHTML = `
                    <div class="placeholder">
                        <i class="fas fa-search"></i>
                        <h2>暂无商品</h2>
                        <p>没有找到符合条件的商品</p>
                    </div>
                `;
                return;
            }

            const itemsHtml = filteredMallItems.map(item => {
                // 生成类型标签HTML
                let typeTagsHtml = '';
                if (item.types && item.types.length > 0) {
                    typeTagsHtml = item.types.map(type => `<span class="mall-item-type">${type}</span>`).join('');
                } else {
                    // 兼容旧格式
                    typeTagsHtml = `<span class="mall-item-type">${item.type}</span>`;
                }

                // 检查是否过期
                const isExpired = item.status === 'expired';
                const isCurrentUser = userToken && currentUser && currentUser.account === item.platformAccount;

                return `
                <div class="mall-item ${isExpired ? 'expired' : ''}" onclick="showItemDetail('${item.id || item.platformAccount}', '${item.platformAccount}', '${item.title}')">
                    <img src="${item.image}" alt="${item.title}" class="mall-item-image">
                    <div class="mall-item-content">
                        <h3 class="mall-item-title">${item.title}</h3>
                        ${isExpired ? '<div class="expired-badge">已到期</div>' : ''}
                        <div class="mall-item-details">
                            <div class="mall-item-row mall-item-price-row">
                                <span class="mall-item-price">¥${(item.price / 100).toFixed(2)}</span>
                                <div class="mall-item-types">${typeTagsHtml}</div>
                            </div>
                            <div class="mall-item-row mall-item-info-row">
                                <span class="mall-item-server-info">区服：${item.server}</span>
                                <span class="mall-item-contact-info" onclick="event.stopPropagation(); copyContactInfo('${item.contact}')">联系方式：${item.contact}</span>
                            </div>
                            <div class="mall-item-row mall-item-user-row">
                                <i class="fas fa-user" style="color: #3498db; margin-right: 4px; font-size: 12px;"></i>
                                <span class="mall-item-nickname">${item.nickname}</span>
                            </div>
                            ${isExpired && isCurrentUser ? `
                                <div class="mall-item-row relist-row">
                                    <button class="relist-btn" onclick="event.stopPropagation(); showRelistModal('${item.id || item.platformAccount}', '${item.platformAccount}', '${item.title}')">
                                        <i class="fas fa-redo"></i> 重新上架
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            container.innerHTML = itemsHtml;
        }



        // 搜索商品
        function searchMallItems() {
            const searchInput = document.getElementById('mall-search-input');
            const query = searchInput.value.trim().toLowerCase();

            // 重新获取商品列表并搜索
            loadMallItems().then(() => {
                if (query === '') {
                    filteredMallItems = [...mallItems];
                } else {
                    filteredMallItems = mallItems.filter(item =>
                        item.title.toLowerCase().includes(query)
                    );
                }

                renderMallItems();
                toggleClearSearchButton();
            });
        }

        // 清空搜索
        function clearMallSearch() {
            document.getElementById('mall-search-input').value = '';
            // 重新获取商品列表
            loadMallItems().then(() => {
                filteredMallItems = [...mallItems];
                renderMallItems();
                toggleClearSearchButton();
            });
        }

        // 切换清空搜索按钮显示
        function toggleClearSearchButton() {
            const searchInput = document.getElementById('mall-search-input');
            const clearBtn = document.getElementById('mall-clear-search');

            if (searchInput.value.trim() !== '') {
                clearBtn.classList.add('show');
            } else {
                clearBtn.classList.remove('show');
            }
        }

        // 复制联系方式到剪切板
        async function copyContactInfo(contactInfo) {
            // 使用统一的复制函数
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(contactInfo).then(() => {
                    showNotification('联系方式已复制', 'success');
                }).catch(() => {
                    fallbackCopyText(contactInfo, '联系方式已复制');
                });
            } else {
                fallbackCopyText(contactInfo, '联系方式已复制');
            }
        }

        // 通用的降级复制函数
        function fallbackCopyText(text, successMessage = '复制成功') {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                showNotification(successMessage, 'success');
            } catch (err) {
                showNotification('复制失败，请手动复制：' + text, 'error');
            }

            document.body.removeChild(textArea);
        }

        // 显示逛页面通知气泡
        function showBrowseNotification(message) {
            const bubble = document.getElementById('browse-notification-bubble');
            if (bubble) {
                bubble.textContent = message;
                bubble.classList.add('show');

                // 3秒后自动隐藏
                setTimeout(() => {
                    bubble.classList.remove('show');
                }, 3000);
            }
        }

        // 打开商品图片预览
        function openMallImageModal(imageSrc, title) {
            const modal = document.getElementById('mall-image-modal');
            const modalImage = document.getElementById('mall-modal-image');
            const zoomControls = document.getElementById('mall-zoom-controls');
            const zoomInfo = document.getElementById('mall-zoom-info');

            modalImage.src = imageSrc;
            modalImage.alt = title;
            modal.style.display = 'flex';

            // 防止页面滚动
            document.body.style.overflow = 'hidden';

            // 检测是否为移动端
            const isMobile = window.innerWidth <= 768;

            // PC端默认300%放大，移动端默认100%
            mallImageZoom = isMobile ? 1 : 3;

            // 移动端显示缩放控制，PC端隐藏
            if (isMobile) {
                zoomControls.style.display = 'flex';
                zoomInfo.style.display = 'block';
            } else {
                zoomControls.style.display = 'none';
                zoomInfo.style.display = 'none';
            }

            // 重置图片状态
            mallImageTranslateX = 0;
            mallImageTranslateY = 0;
            mallImageIsDragging = false;

            // 初始化图片变换
            updateMallImageTransform();
            updateMallZoomInfo();
            updateMallZoomButtons();

            // 图片加载完成后的处理
            modalImage.onload = function() {
                modalImage.style.opacity = '1';
                // 初始化缩放和拖拽功能
                initMallImageInteraction();
            };
            modalImage.style.opacity = '0.8';
        }

        // 关闭商品图片预览
        function closeMallImageModal() {
            const modal = document.getElementById('mall-image-modal');
            const zoomControls = document.getElementById('mall-zoom-controls');
            const zoomInfo = document.getElementById('mall-zoom-info');

            modal.style.display = 'none';

            // 恢复页面滚动
            document.body.style.overflow = 'auto';

            // 隐藏缩放控制
            if (zoomControls) zoomControls.style.display = 'none';
            if (zoomInfo) zoomInfo.style.display = 'none';

            // 重置图片状态
            mallImageZoom = 1;
            mallImageTranslateX = 0;
            mallImageTranslateY = 0;
            mallImageIsDragging = false;
        }

        // 商品图片交互变量
        let mallImageTranslateX = 0;
        let mallImageTranslateY = 0;
        let mallImageIsDragging = false;
        let mallImageStartX = 0;
        let mallImageStartY = 0;
        let mallImageInitialDistance = 0;
        let mallImageInitialZoom = 1;

        // 初始化商品图片交互功能
        function initMallImageInteraction() {
            const modalImage = document.getElementById('mall-modal-image');
            const container = document.querySelector('#mall-image-modal .modal-image-container');

            if (!modalImage || !container) return;

            // 移除之前的事件监听器
            modalImage.removeEventListener('mousedown', mallImageStartDrag);
            modalImage.removeEventListener('touchstart', mallImageHandleTouchStart);
            modalImage.removeEventListener('dblclick', mallImageHandleDoubleClick);
            container.removeEventListener('wheel', mallImageHandleWheel);

            // 添加鼠标事件
            modalImage.addEventListener('mousedown', mallImageStartDrag);
            document.addEventListener('mousemove', mallImageDrag);
            document.addEventListener('mouseup', mallImageEndDrag);

            // 添加双击缩放
            modalImage.addEventListener('dblclick', mallImageHandleDoubleClick);

            // 添加触摸事件（合并拖拽和缩放）
            modalImage.addEventListener('touchstart', mallImageHandleTouchStart);
            modalImage.addEventListener('touchmove', mallImageHandleTouchMove);
            modalImage.addEventListener('touchend', mallImageHandleTouchEnd);

            // 添加滚轮缩放
            container.addEventListener('wheel', mallImageHandleWheel);
        }

        // 更新商品图片变换
        function updateMallImageTransform() {
            const modalImage = document.getElementById('mall-modal-image');
            if (modalImage) {
                modalImage.style.transform = `scale(${mallImageZoom}) translate(${mallImageTranslateX}px, ${mallImageTranslateY}px)`;
                modalImage.style.cursor = mallImageZoom > 1 ? 'grab' : 'zoom-in';
                modalImage.style.transformOrigin = 'center center';
            }
        }

        // 更新缩放信息显示
        function updateMallZoomInfo() {
            const zoomInfo = document.getElementById('mall-zoom-info');
            if (zoomInfo) {
                zoomInfo.textContent = Math.round(mallImageZoom * 100) + '%';
            }
        }

        // 更新缩放按钮状态
        function updateMallZoomButtons() {
            const zoomInBtn = document.getElementById('mall-zoom-in-btn');
            const zoomOutBtn = document.getElementById('mall-zoom-out-btn');

            if (zoomInBtn) {
                zoomInBtn.disabled = mallImageZoom >= 5;
            }
            if (zoomOutBtn) {
                zoomOutBtn.disabled = mallImageZoom <= 0.5;
            }
        }

        // 放大图片
        function mallImageZoomIn() {
            const newZoom = mallImageZoom * 1.2;
            if (newZoom <= 5) {
                mallImageZoom = newZoom;
                updateMallImageTransform();
                updateMallZoomInfo();
                updateMallZoomButtons();
            }
        }

        // 缩小图片
        function mallImageZoomOut() {
            const newZoom = mallImageZoom * 0.8;
            if (newZoom >= 0.5) {
                mallImageZoom = newZoom;
                updateMallImageTransform();
                updateMallZoomInfo();
                updateMallZoomButtons();
            }
        }

        // 重置缩放
        function mallImageResetZoom() {
            mallImageZoom = 1;
            mallImageTranslateX = 0;
            mallImageTranslateY = 0;
            updateMallImageTransform();
            updateMallZoomInfo();
            updateMallZoomButtons();
        }

        // 开始拖拽（鼠标）
        function mallImageStartDrag(e) {
            if (mallImageZoom <= 1) return;
            mallImageIsDragging = true;
            mallImageStartX = e.clientX - mallImageTranslateX;
            mallImageStartY = e.clientY - mallImageTranslateY;
            e.preventDefault();
        }

        // 开始拖拽（触摸）
        function mallImageStartDragTouch(e) {
            if (mallImageZoom <= 1 || e.touches.length !== 1) return;
            mallImageIsDragging = true;
            mallImageStartX = e.touches[0].clientX - mallImageTranslateX;
            mallImageStartY = e.touches[0].clientY - mallImageTranslateY;
            e.preventDefault();
        }

        // 拖拽中（鼠标）
        function mallImageDrag(e) {
            if (!mallImageIsDragging || mallImageZoom <= 1) return;
            mallImageTranslateX = e.clientX - mallImageStartX;
            mallImageTranslateY = e.clientY - mallImageStartY;
            updateMallImageTransform();
            e.preventDefault();
        }

        // 拖拽中（触摸）
        function mallImageDragTouch(e) {
            if (!mallImageIsDragging || mallImageZoom <= 1 || e.touches.length !== 1) return;
            mallImageTranslateX = e.touches[0].clientX - mallImageStartX;
            mallImageTranslateY = e.touches[0].clientY - mallImageStartY;
            updateMallImageTransform();
            e.preventDefault();
        }

        // 结束拖拽
        function mallImageEndDrag() {
            mallImageIsDragging = false;
        }

        // 滚轮缩放
        function mallImageHandleWheel(e) {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = mallImageZoom * factor;

            if (newZoom >= 0.5 && newZoom <= 5) {
                mallImageZoom = newZoom;
                updateMallImageTransform();
                updateMallZoomInfo();
                updateMallZoomButtons();
            }
        }

        // 双击缩放
        function mallImageHandleDoubleClick(e) {
            e.preventDefault();
            if (mallImageZoom === 1) {
                mallImageZoom = 2;
            } else {
                mallImageResetZoom();
                return;
            }
            updateMallImageTransform();
            updateMallZoomInfo();
            updateMallZoomButtons();
        }

        // 获取两点间距离
        function mallImageGetDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // 合并的触摸事件处理
        function mallImageHandleTouchStart(e) {
            if (e.touches.length === 1) {
                // 单指拖拽
                if (mallImageZoom > 1) {
                    mallImageIsDragging = true;
                    mallImageStartX = e.touches[0].clientX - mallImageTranslateX;
                    mallImageStartY = e.touches[0].clientY - mallImageTranslateY;
                }
            } else if (e.touches.length === 2) {
                // 双指缩放
                mallImageInitialDistance = mallImageGetDistance(e.touches[0], e.touches[1]);
                mallImageInitialZoom = mallImageZoom;
            }
            e.preventDefault();
        }

        function mallImageHandleTouchMove(e) {
            if (e.touches.length === 1 && mallImageIsDragging && mallImageZoom > 1) {
                // 单指拖拽
                mallImageTranslateX = e.touches[0].clientX - mallImageStartX;
                mallImageTranslateY = e.touches[0].clientY - mallImageStartY;
                updateMallImageTransform();
            } else if (e.touches.length === 2) {
                // 双指缩放
                const currentDistance = mallImageGetDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / mallImageInitialDistance;
                const newZoom = mallImageInitialZoom * scale;

                if (newZoom >= 0.5 && newZoom <= 5) {
                    mallImageZoom = newZoom;
                    updateMallImageTransform();
                    updateMallZoomInfo();
                    updateMallZoomButtons();
                }
            }
            e.preventDefault();
        }

        function mallImageHandleTouchEnd(e) {
            if (e.touches.length < 2) {
                mallImageInitialDistance = 0;
                mallImageInitialZoom = 1;
            }
            if (e.touches.length === 0) {
                mallImageIsDragging = false;
            }
        }

        // 搜索框事件监听（在DOMContentLoaded中初始化）
        document.addEventListener('DOMContentLoaded', function() {
            // 模态框点击外部关闭
            const mallModal = document.getElementById('mall-image-modal');
            if (mallModal) {
                mallModal.addEventListener('click', function(e) {
                    if (e.target === mallModal) {
                        closeMallImageModal();
                    }
                });
            }

            // 键盘快捷键支持
            document.addEventListener('keydown', function(e) {
                const mallModal = document.getElementById('mall-image-modal');
                if (mallModal && mallModal.style.display === 'flex') {
                    switch(e.key) {
                        case 'Escape':
                            closeMallImageModal();
                            break;
                    }
                }
            });
        });

        // 吹牛大王功能
        let bragQuestions = [];
        let selectedAnswer = null;
        let currentQuestionId = null;

        // 内置题目模板
        const bragTemplates = [
            {
                title: '我是吹牛大王？',
                answerA: '我是',
                answerB: '我不是'
            },
            {
                title: '明天吃什么？',
                answerA: '火锅',
                answerB: '稀饭'
            },
            {
                title: '今天是什么天气？',
                answerA: '晴天',
                answerB: '雨天'
            },
            {
                title: '爱天书还是爱妖火？',
                answerA: '爱天书',
                answerB: '爱妖火'
            },
            {
                title: '我是吴彦祖？',
                answerA: '你是',
                answerB: '我才是'
            }
        ];

        // 初始化吹牛大王功能
        function initBragKing() {
            // 绑定创建题目表单事件
            const createForm = document.getElementById('brag-create-form');
            if (createForm) {
                createForm.addEventListener('submit', handleCreateQuestion);
            }

            // 加载题目列表
            loadBragQuestions();
        }

        // 处理创建题目表单提交
        async function handleCreateQuestion(e) {
            e.preventDefault();

            if (!userToken) {
                showSimpleAlert('未登录', '请先登录后再发起挑战', null, 'warning', 'center');
                return;
            }

            const title = document.getElementById('brag-title').value.trim();
            const answerA = document.getElementById('brag-answer-a').value.trim();
            const answerB = document.getElementById('brag-answer-b').value.trim();
            const correctAnswer = document.getElementById('brag-correct-answer').value;
            const bet = document.getElementById('brag-bet').value;

            // 验证输入
            if (!title || !answerA || !answerB || !correctAnswer || !bet) {
                showSimpleAlert('信息不完整', '请填写完整的题目信息', null, 'error');
                return;
            }

            const betAmount = parseInt(bet);
            if (isNaN(betAmount) || betAmount < 10) {
                showSimpleAlert('赌注错误', '赌注最少为10火币', null, 'error');
                return;
            }

            // 检查用户火币是否足够
            if (currentUser && currentUser.coins < betAmount) {
                showSimpleAlert('火币不足', `发起挑战需要 ${betAmount} 火币，您当前只有 ${currentUser.coins} 火币`, null, 'error');
                return;
            }

            // 使用自定义确认对话框
            showCustomConfirm(
                '确认创建题目',
                `题目：${title}\n赌注：${betAmount} 火币\n\n创建后将扣除 ${betAmount} 个火币`,
                async (confirmed) => {
                    if (!confirmed) return;

                    await submitCreateQuestion(title, answerA, answerB, correctAnswer, betAmount);
                }
            );
        }

        // 提交创建题目请求
        async function submitCreateQuestion(title, answerA, answerB, correctAnswer, betAmount) {

            try {
                const response = await fetch('/api/brag/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        title,
                        answerA,
                        answerB,
                        correctAnswer,
                        bet: betAmount
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // 更新用户火币显示
                    if (currentUser) {
                        currentUser.coins = data.newCoins;
                        updateUserDisplay();
                    }

                    // 使用简约弹窗显示成功信息
                    showSimpleAlert('创建成功', `创建题目成功，剩余 ${data.newCoins} 火币`, null, 'success');

                    // 隐藏创建区域并重新加载题目列表
                    toggleCreateSection();
                    setTimeout(() => {
                        loadBragQuestions();
                    }, 1000);
                } else {
                    // 所有创建失败的错误都使用简约UI显示
                    showSimpleAlert('创建失败', data.message || '创建题目失败', null, 'error');
                }
            } catch (error) {
                console.error('创建题目错误:', error);
                showSimpleAlert('网络错误', '网络连接异常，请稍后重试', null, 'error');
            }
        }

        // 切换创建题目区域显示
        function toggleCreateSection() {
            const createSection = document.getElementById('brag-create-section');
            const createBtn = document.getElementById('create-question-btn');

            if (createSection.style.display === 'none') {
                // 检查登录状态
                if (!userToken) {
                    showSimpleAlert('未登录', '请先登录后再发起挑战', null, 'warning', 'center');
                    return;
                }

                createSection.style.display = 'block';
                createBtn.style.display = 'none';

                // 填充随机模板
                fillRandomTemplate();
            } else {
                createSection.style.display = 'none';
                createBtn.style.display = 'block';
            }
        }

        // 填充随机题目模板
        function fillRandomTemplate() {
            const randomTemplate = bragTemplates[Math.floor(Math.random() * bragTemplates.length)];

            document.getElementById('brag-title').value = randomTemplate.title;
            document.getElementById('brag-answer-a').value = randomTemplate.answerA;
            document.getElementById('brag-answer-b').value = randomTemplate.answerB;
            document.getElementById('brag-correct-answer').value = ''; // 需要用户选择
            document.getElementById('brag-bet').value = '10'; // 默认赌注
        }

        // 加载吹牛大王题目列表
        async function loadBragQuestions() {
            try {
                const response = await fetch('/api/brag/questions', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    bragQuestions = data.questions;
                    displayBragQuestions();
                } else {
                    console.error('加载题目列表失败:', data.message);
                    displayBragQuestions([]);
                }
            } catch (error) {
                console.error('加载题目列表错误:', error);
                displayBragQuestions([]);
                throw error; // 重新抛出错误以便刷新函数处理
            }
        }

        // 刷新题目列表
        let isRefreshing = false;
        function refreshBragQuestions() {
            // 防止重复点击
            if (isRefreshing) {
                return;
            }

            const refreshBtn = document.querySelector('.refresh-btn');
            const originalContent = refreshBtn.innerHTML;

            isRefreshing = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>刷新中...';
            refreshBtn.disabled = true;

            // 立即触发刷新
            loadBragQuestions().then(() => {
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;

                // 2秒后才允许再次刷新
                setTimeout(() => {
                    isRefreshing = false;
                }, 2000);
            }).catch(() => {
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;

                // 出错时也要重置状态
                setTimeout(() => {
                    isRefreshing = false;
                }, 2000);
            });
        }

        // 显示吹牛记录
        async function showBragRecords() {
            if (!userToken) {
                showBrowseNotification('请先登录');
                return;
            }

            const modal = document.getElementById('brag-records-modal');
            const content = document.getElementById('brag-records-content');

            // 显示模态框
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 显示加载状态
            content.innerHTML = '<div class="loader"><div></div></div>';

            try {
                const response = await fetch('/api/brag/records', {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    displayBragRecords(data.records);
                } else {
                    content.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${data.message || '获取记录失败'}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('获取吹牛记录失败:', error);
                content.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        获取记录失败，请稍后重试
                    </div>
                `;
            }
        }

        // 显示吹牛记录列表
        function displayBragRecords(records) {
            const content = document.getElementById('brag-records-content');

            if (!records || records.length === 0) {
                content.innerHTML = `
                    <div class="placeholder">
                        <i class="fas fa-history"></i>
                        <h3>暂无记录</h3>
                        <p>快去参与吹牛大王挑战吧！</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="brag-records-list">';
            records.forEach(record => {
                let resultClass, resultIcon, resultText;
                if (record.result === 'win') {
                    resultClass = 'win';
                    resultIcon = 'fa-trophy';
                    resultText = '胜利';
                } else if (record.result === 'lose') {
                    resultClass = 'lose';
                    resultIcon = 'fa-times-circle';
                    resultText = '失败';
                } else {
                    resultClass = 'pending';
                    resultIcon = 'fa-clock';
                    resultText = '等待中';
                }

                html += `
                    <div class="brag-record-item ${resultClass}">
                        <div class="record-header">
                            <div class="record-title">${escapeHtml(record.title)}</div>
                            <div class="record-result ${resultClass}">
                                <i class="fas ${resultIcon}"></i>
                                ${resultText}
                            </div>
                        </div>
                        <div class="record-details">
                            <div class="record-info">
                                <span class="record-label">类型：</span>
                                <span class="record-value">${record.type === 'create' ? '发起挑战' : '参与挑战'}</span>
                            </div>
                            <div class="record-info">
                                <span class="record-label">赌注：</span>
                                <span class="record-value">${record.bet} 火币</span>
                            </div>
                            <div class="record-info">
                                <span class="record-label">时间：</span>
                                <span class="record-value">${formatDateTime(record.time)}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            content.innerHTML = html;
        }

        // 关闭吹牛记录模态框
        function closeBragRecordsModal() {
            const modal = document.getElementById('brag-records-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 显示吹牛排行榜
        async function showBragRanking() {
            const modal = document.getElementById('brag-ranking-modal');
            const content = document.getElementById('brag-ranking-content');

            // 显示模态框
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 显示加载状态
            content.innerHTML = '<div class="loader"><div></div></div>';

            try {
                const response = await fetch('/api/brag/ranking');
                const data = await response.json();

                if (data.success) {
                    displayBragRanking(data.ranking);
                } else {
                    content.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${data.message || '获取排行榜失败'}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('获取吹牛排行榜失败:', error);
                content.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        获取排行榜失败，请稍后重试
                    </div>
                `;
            }
        }

        // 显示吹牛排行榜列表
        function displayBragRanking(ranking) {
            const content = document.getElementById('brag-ranking-content');

            if (!ranking || ranking.length === 0) {
                content.innerHTML = `
                    <div class="placeholder">
                        <i class="fas fa-trophy"></i>
                        <h3>暂无排行数据</h3>
                        <p>快去参与吹牛大王挑战吧！</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="brag-records-list">';
            ranking.forEach(item => {
                let rankClass = '';
                let rankIcon = '';
                if (item.rank === 1) {
                    rankClass = 'win';
                    rankIcon = 'fa-crown';
                } else if (item.rank === 2) {
                    rankClass = 'challenged';
                    rankIcon = 'fa-medal';
                } else if (item.rank === 3) {
                    rankClass = 'pending';
                    rankIcon = 'fa-award';
                } else {
                    rankClass = 'lose';
                    rankIcon = 'fa-trophy';
                }

                html += `
                    <div class="brag-record-item ${rankClass}">
                        <div class="record-header">
                            <div class="record-title">
                                <i class="fas ${rankIcon}"></i>
                                第${item.rank}名 ${escapeHtml(item.username)}
                            </div>
                            <div class="record-result ${rankClass}">
                                胜利${item.winCount}次
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            content.innerHTML = html;
        }

        // 关闭吹牛排行榜模态框
        function closeBragRankingModal() {
            const modal = document.getElementById('brag-ranking-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 格式化日期时间
        function formatDateTime(dateString) {
            const date = new Date(dateString);

            // 后端保存的时间已经是北京时间+8小时的ISO字符串
            // 所以我们需要减去8小时来显示正确的北京时间
            const correctedDate = new Date(date.getTime() - (8 * 60 * 60 * 1000));

            // 显示完整的年月日时分秒格式：2025-09-21 23:35:21
            return correctedDate.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');
        }

        // 显示题目列表
        function displayBragQuestions() {
            const listContainer = document.getElementById('brag-questions-list');

            if (!bragQuestions || bragQuestions.length === 0) {
                listContainer.innerHTML = `
                    <div class="placeholder">
                        <i class="fas fa-crown"></i>
                        <h3>暂无大话题目</h3>
                        <p>快来发起第一个挑战吧！</p>
                    </div>
                `;
                return;
            }

            // 按创建时间倒序排序
            const sortedQuestions = [...bragQuestions].sort((a, b) => {
                return new Date(b.publishTime) - new Date(a.publishTime);
            });

            let html = '';
            sortedQuestions.forEach(question => {
                const statusText = getStatusText(question.status);
                const statusClass = question.status;
                // 重新计算canChallenge，确保currentUser已加载
                const canChallenge = question.status === 'waiting' &&
                                   userToken &&
                                   currentUser &&
                                   !question.isOwnQuestion;

                // 按钮禁用条件：未登录或者是自己的题目
                const shouldDisableButton = !userToken ||
                                          !currentUser ||
                                          question.isOwnQuestion;

                console.log('题目挑战检查:', {
                    questionId: question.id,
                    status: question.status,
                    userToken: !!userToken,
                    currentUser: !!currentUser,
                    isOwnQuestion: question.isOwnQuestion,
                    canChallenge: canChallenge
                });

                html += `
                    <div class="brag-question-item ${statusClass}">
                        <div class="brag-question-header">
                            <h3 class="brag-question-title">${escapeHtml(question.title)}</h3>
                            <span class="brag-question-status ${statusClass}">${statusText}</span>
                        </div>

                        <div class="brag-question-info">
                            <div class="brag-question-creator">
                                <i class="fas fa-user"></i>
                                发起者：${escapeHtml(question.creatorNickname || question.creator)}
                            </div>
                            <div class="brag-question-bet">
                                <i class="fas fa-coins"></i>
                                赌注：${question.bet} 火币
                            </div>
                        </div>

                        ${question.status === 'waiting' ? `
                            <div class="brag-answers">
                                <button class="brag-answer-btn" onclick="selectAnswer('${question.id}', '答案一')"
                                        ${shouldDisableButton ? 'disabled' : ''}>
                                    答案一：${escapeHtml(question.answerA)}
                                </button>
                                <button class="brag-answer-btn" onclick="selectAnswer('${question.id}', '答案二')"
                                        ${shouldDisableButton ? 'disabled' : ''}>
                                    答案二：${escapeHtml(question.answerB)}
                                </button>
                            </div>
                        ` : `
                            <div class="brag-answers">
                                <div class="brag-answer-btn" style="cursor: default; border-color: #e0e0e0;">
                                    答案一：${escapeHtml(question.answerA)}
                                </div>
                                <div class="brag-answer-btn" style="cursor: default; border-color: #e0e0e0;">
                                    答案二：${escapeHtml(question.answerB)}
                                </div>
                            </div>
                        `}

                        ${question.status === 'waiting' ? `
                            <div class="brag-question-actions">
                                <button class="brag-challenge-btn" onclick="challengeQuestion('${question.id}')"
                                        ${shouldDisableButton ? 'disabled' : ''}>
                                    ${!userToken ? '请先登录' :
                                      !currentUser ? '请先登录' :
                                      question.isOwnQuestion ? '不能挑战自己' :
                                      '参与挑战'}
                                </button>
                            </div>
                        ` : question.status === 'challenged' ? `
                            <div class="brag-question-info">
                                <div style="color: #f39c12;">
                                    <i class="fas fa-user-shield"></i>
                                    挑战者：${escapeHtml(question.challengerNickname || question.challenger || '未知')}
                                    选择了：${escapeHtml(question.challengerAnswer || '未知')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            listContainer.innerHTML = html;
        }

        // 获取状态文本
        function getStatusText(status) {
            switch (status) {
                case 'waiting': return '等待挑战';
                case 'challenged': return '已被挑战';
                default: return '未知状态';
            }
        }

        // 选择答案
        function selectAnswer(questionId, answer) {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            selectedAnswer = answer;
            currentQuestionId = questionId;

            // 清除所有题目的选中状态
            document.querySelectorAll('.brag-answer-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // 高亮选中的答案
            const questionItems = document.querySelectorAll('.brag-question-item');
            for (const item of questionItems) {
                const answerBtns = item.querySelectorAll('.brag-answer-btn');
                const questionTitle = item.querySelector('.brag-question-title').textContent;
                const question = bragQuestions.find(q => q.title === questionTitle);

                if (question && question.id == questionId) {
                    const selectedBtn = Array.from(answerBtns).find(btn =>
                        btn.textContent.includes(answer === '答案一' ? question.answerA : question.answerB)
                    );

                    if (selectedBtn) {
                        selectedBtn.classList.add('selected');
                        console.log('选中答案:', answer, '题目ID:', questionId);
                    }
                    break;
                }
            }
        }

        // 参与挑战
        async function challengeQuestion(questionId) {
            if (!userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            if (!currentUser) {
                showNotification('用户信息加载中，请稍后重试', 'error');
                return;
            }

            const question = bragQuestions.find(q => q.id == questionId);
            if (!question) {
                showNotification('题目不存在', 'error');
                return;
            }

            if (question.isOwnQuestion) {
                showNotification('不能挑战自己的题目', 'error');
                return;
            }

            if (!selectedAnswer || currentQuestionId != questionId) {
                showNotification('请先选择一个答案', 'error');
                return;
            }

            // 使用自定义确认对话框
            showCustomConfirm(
                '确认参与挑战',
                `题目：${question.title}\n你的选择：${selectedAnswer}\n\n需要支付 ${question.bet} 个火币`,
                async (confirmed) => {
                    if (!confirmed) return;

                    await submitChallenge(questionId, selectedAnswer);
                }
            );
        }

        // 提交挑战请求
        async function submitChallenge(questionId, answer) {

            try {
                const response = await fetch('/api/brag/challenge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        questionId: questionId,
                        answer: answer
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // 更新用户火币显示
                    if (currentUser) {
                        currentUser.coins = data.newCoins;
                        updateUserDisplay();
                    }

                    // 使用自定义结果显示框
                    let coinsInfo = '';
                    if (data.result === 'win') {
                        coinsInfo = `获得 ${data.coinsEarned} 个火币`;
                        if (data.feePercent && data.feePercent > 0) {
                            coinsInfo += `\n(已扣除${data.feePercent}%手续费)`;
                        }
                    } else {
                        coinsInfo = `失去 ${data.coinsLost} 个火币`;
                    }

                    showResultModal(data.result, data.message, coinsInfo);

                    // 重新加载题目列表
                    setTimeout(() => {
                        loadBragQuestions();
                    }, 2000);
                } else {
                    // 如果是题目不存在，显示自定义UI
                    if (data.message && data.message.includes('题目不存在')) {
                        showSimpleAlert('题目已被抢走', '当前题目已被别人抢走啦！', () => {
                            // 点击确定后自动刷新大话
                            refreshBragQuestions();
                        });
                    } else {
                        showNotification(data.message || '挑战失败', 'error');
                    }
                }
            } catch (error) {
                console.error('挑战错误:', error);
                showNotification('网络错误，请稍后重试', 'error');
            }

            // 清除选择状态
            selectedAnswer = null;
            currentQuestionId = null;
        }

        // HTML转义函数
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 自定义UI组件函数
        // 显示成功气泡
        function showSuccessBubble(message) {
            const bubble = document.getElementById('success-bubble');
            const text = document.getElementById('success-bubble-text');

            text.textContent = message;
            bubble.style.display = 'block';
            bubble.classList.add('show');

            // 3秒后自动隐藏
            setTimeout(() => {
                bubble.classList.remove('show');
                setTimeout(() => {
                    bubble.style.display = 'none';
                }, 300); // 等待动画完成
            }, 3000);
        }

        // 自定义确认对话框
        let confirmCallback = null;

        function showCustomConfirm(title, message, callback) {
            const modal = document.getElementById('custom-confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');

            titleEl.textContent = title;
            messageEl.textContent = message;
            confirmCallback = callback;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeCustomConfirm(result) {
            const modal = document.getElementById('custom-confirm-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';

            if (confirmCallback) {
                confirmCallback(result);
                confirmCallback = null;
            }
        }

        // 显示结果模态框
        function showResultModal(result, message, coinsInfo = '') {
            const modal = document.getElementById('result-modal');
            const icon = document.getElementById('result-icon');
            const title = document.getElementById('result-title');
            const messageEl = document.getElementById('result-message');

            // 清除之前的样式
            icon.className = 'result-icon';
            title.className = 'result-title';

            if (result === 'win') {
                icon.classList.add('win');
                title.classList.add('win');
                icon.innerHTML = '<i class="fas fa-trophy"></i>';
                title.textContent = '挑战成功！';
            } else {
                icon.classList.add('lose');
                title.classList.add('lose');
                icon.innerHTML = '<i class="fas fa-times-circle"></i>';
                title.textContent = '挑战失败';
            }

            messageEl.innerHTML = message + (coinsInfo ? '<br><br>' + coinsInfo : '');

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeResultModal() {
            const modal = document.getElementById('result-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // 简约提示框
        let simpleAlertCallback = null;

        function showSimpleAlert(title, message, callback = null, type = 'warning', position = 'center') {
            const modal = document.getElementById('simple-alert-modal');
            const titleEl = document.getElementById('simple-alert-title');
            const messageEl = document.getElementById('simple-alert-message');
            const iconEl = document.querySelector('.simple-alert-icon');
            const iconI = iconEl.querySelector('i');

            titleEl.textContent = title;
            messageEl.textContent = message;
            simpleAlertCallback = callback;

            // 根据类型设置图标和样式
            iconEl.className = `simple-alert-icon ${type}`;
            switch (type) {
                case 'success':
                    iconI.className = 'fas fa-check-circle';
                    break;
                case 'error':
                    iconI.className = 'fas fa-times-circle';
                    break;
                case 'warning':
                default:
                    iconI.className = 'fas fa-exclamation-triangle';
                    break;
            }

            // 设置位置
            modal.className = position === 'top' ? 'simple-alert-modal top-center' : 'simple-alert-modal';

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeSimpleAlert() {
            const modal = document.getElementById('simple-alert-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';

            if (simpleAlertCallback) {
                simpleAlertCallback();
                simpleAlertCallback = null;
            }
        }

        // 重新上架相关变量
        let relistItemData = null;

        // 显示重新上架模态框
        async function showRelistModal(itemId, platformAccount, title) {
            try {
                // 获取上架费用
                const feeResponse = await fetch('/api/config/listing-fee');
                const feeData = await feeResponse.json();
                const dailyFee = feeData.success ? feeData.fee : 1;

                relistItemData = { itemId: itemId || platformAccount, platformAccount: platformAccount || title, title: title || platformAccount };

                document.getElementById('relist-item-title').textContent = title;
                document.getElementById('relist-daily-fee').textContent = dailyFee;
                document.getElementById('relist-total-fee').textContent = dailyFee * 7;

                // 监听天数变化
                const daysInput = document.getElementById('relist-days');
                daysInput.addEventListener('input', function() {
                    const days = parseInt(this.value) || 1;
                    const totalFee = dailyFee * days;
                    document.getElementById('relist-total-fee').textContent = totalFee;
                });

                document.getElementById('relist-modal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('获取上架费用失败:', error);
                showNotification('获取上架费用失败', 'error');
            }
        }

        // 关闭重新上架模态框
        function closeRelistModal() {
            document.getElementById('relist-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
            relistItemData = null;
        }

        // 确认重新上架
        async function confirmRelist() {
            if (!relistItemData || !userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            const days = parseInt(document.getElementById('relist-days').value);
            if (!days || days < 1 || days > 30) {
                showNotification('请输入有效的上架天数（1-30天）', 'error');
                return;
            }

            try {
                const response = await fetch('/api/mall/relist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        itemId: relistItemData.itemId,
                        platformAccount: relistItemData.platformAccount,
                        title: relistItemData.title,
                        days: days
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.message, 'success');
                    closeRelistModal();
                    // 刷新商品列表
                    loadMallItems();
                    // 刷新用户信息
                    if (typeof loadUserInfo === 'function') {
                        loadUserInfo();
                    }
                } else {
                    showNotification(data.message || '重新上架失败', 'error');
                }
            } catch (error) {
                console.error('重新上架失败:', error);
                showNotification('重新上架失败，请重试', 'error');
            }
        }

        // 分享商品功能
        function shareItem() {
            if (!currentItemDetail || !currentItemDetail.id) {
                showNotification('无法获取商品信息', 'error');
                return;
            }

            const shareUrl = `${window.location.origin}${window.location.pathname}?i=${currentItemDetail.id}`;

            // 复制到剪贴板 - 使用统一的复制函数
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showNotification('复制商品地址成功', 'success');
                }).catch(() => {
                    fallbackCopyText(shareUrl, '复制商品地址成功');
                });
            } else {
                fallbackCopyText(shareUrl, '复制商品地址成功');
            }
        }

        // 处理分享链接访问
        function handleShareLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('i');

            if (itemId && itemId.startsWith('sp')) {
                // 直接显示指定商品
                showItemDetail(itemId);
            }
        }

        // 分享用户商品功能
        function shareUserItems() {
            if (!currentUser || !currentUser.id) {
                showNotification('无法获取用户信息', 'error');
                return;
            }

            const shareUrl = `${window.location.origin}${window.location.pathname}?v=${currentUser.id}`;

            // 复制到剪贴板 - 使用统一的复制函数
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showNotification('复制商品地址成功', 'success');
                }).catch(() => {
                    fallbackCopyText(shareUrl, '复制商品地址成功');
                });
            } else {
                fallbackCopyText(shareUrl, '复制商品地址成功');
            }
        }

        // 处理用户商品页面分享链接访问
        function handleUserShareLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('v');

            if (userId) {
                console.log('检测到用户分享链接，用户ID:', userId);
                // 显示用户商品页面
                showUserItemsPageById(userId);
            }
        }

        // 通过用户ID显示用户商品页面
        async function showUserItemsPageById(userId) {
            console.log('开始显示用户商品页面，用户ID:', userId);

            try {
                // 显示用户商品页面
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.getElementById('user-items-page').classList.add('active');

                // 显示加载状态
                document.getElementById('user-items-avatar').textContent = '...';
                document.getElementById('user-items-nickname').textContent = '加载中...';
                document.getElementById('user-items-id').textContent = 'ID: ...';
                document.getElementById('user-items-container').innerHTML = '<div class="loading">正在加载用户信息...</div>';

                console.log('正在请求用户信息...');

                // 获取用户信息
                const userResponse = await fetch(`/api/user/public-info-by-id?id=${encodeURIComponent(userId)}`);

                console.log('用户信息响应状态:', userResponse.status);

                if (!userResponse.ok) {
                    let errorText;
                    try {
                        const errorJson = await userResponse.json();
                        errorText = errorJson.message || `HTTP ${userResponse.status}`;
                    } catch (e) {
                        errorText = await userResponse.text() || `HTTP ${userResponse.status}`;
                    }
                    console.error('用户信息请求失败:', userResponse.status, userResponse.statusText, errorText);
                    throw new Error(errorText);
                }

                const userData = await userResponse.json();
                console.log('用户信息响应数据:', userData);

                if (!userData.success) {
                    console.error('用户信息获取失败:', userData.message);
                    showNotification(userData.message || '用户不存在', 'error');
                    return;
                }

                const user = userData.user;

                // 更新用户信息显示
                const avatar = document.getElementById('user-items-avatar');
                if (user.avatar) {
                    avatar.innerHTML = `<img src="${user.avatar}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else {
                    avatar.textContent = user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U';
                }

                document.getElementById('user-items-nickname').textContent = user.nickname || user.username || '未知用户';
                document.getElementById('user-items-id').textContent = `ID: ${user.id || 'N/A'}`;

                // 获取用户商品
                const itemsResponse = await fetch(`/api/user/items-by-id?id=${encodeURIComponent(userId)}`);

                if (!itemsResponse.ok) {
                    throw new Error('获取用户商品失败');
                }

                const itemsData = await itemsResponse.json();

                if (itemsData.success) {
                    renderUserItems(itemsData.items);
                } else {
                    throw new Error(itemsData.message || '获取用户商品失败');
                }

            } catch (error) {
                console.error('显示用户商品页面失败:', error);
                document.getElementById('user-items-container').innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${error.message || '加载失败，请稍后重试'}
                    </div>
                `;
            }
        }

        // 显示用户商品页面
        async function showUserItemsPage(username) {
            console.log('开始显示用户商品页面，用户名:', username);

            try {
                // 显示用户商品页面
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.getElementById('user-items-page').classList.add('active');

                // 显示加载状态
                document.getElementById('user-items-avatar').textContent = '...';
                document.getElementById('user-items-nickname').textContent = '加载中...';
                document.getElementById('user-items-id').textContent = 'ID: ...';
                document.getElementById('user-items-container').innerHTML = '<div class="loading">正在加载用户信息...</div>';

                console.log('正在请求用户信息...');

                // 获取用户信息
                const userResponse = await fetch(`/api/user/public-info?username=${encodeURIComponent(username)}`);

                console.log('用户信息响应状态:', userResponse.status);

                if (!userResponse.ok) {
                    let errorText;
                    try {
                        const errorJson = await userResponse.json();
                        errorText = errorJson.message || `HTTP ${userResponse.status}`;
                    } catch (e) {
                        errorText = await userResponse.text() || `HTTP ${userResponse.status}`;
                    }
                    console.error('用户信息请求失败:', userResponse.status, userResponse.statusText, errorText);
                    throw new Error(errorText);
                }

                const userData = await userResponse.json();
                console.log('用户信息响应数据:', userData);

                if (!userData.success) {
                    console.error('用户信息获取失败:', userData.message);
                    showNotification(userData.message || '用户不存在', 'error');
                    showPage('home');
                    return;
                }

                console.log('正在请求用户商品...');

                // 获取用户商品
                const itemsResponse = await fetch(`/api/user/public-items?username=${encodeURIComponent(username)}`);

                console.log('用户商品响应状态:', itemsResponse.status);

                if (!itemsResponse.ok) {
                    let errorText;
                    try {
                        const errorJson = await itemsResponse.json();
                        errorText = errorJson.message || `HTTP ${itemsResponse.status}`;
                    } catch (e) {
                        errorText = await itemsResponse.text() || `HTTP ${itemsResponse.status}`;
                    }
                    console.error('用户商品请求失败:', itemsResponse.status, itemsResponse.statusText, errorText);
                    throw new Error(errorText);
                }

                const itemsData = await itemsResponse.json();
                console.log('用户商品响应数据:', itemsData);

                if (itemsData.success) {
                    console.log('开始渲染用户商品页面...');
                    renderUserItemsPage(userData.user, itemsData.items);
                } else {
                    console.error('获取用户商品失败:', itemsData.message);
                    showNotification(itemsData.message || '获取用户商品失败', 'error');
                    showPage('home');
                }
            } catch (error) {
                console.error('显示用户商品页面错误:', error);
                showNotification(`加载失败: ${error.message}`, 'error');
                showPage('home');
            }
        }

        // 渲染用户商品列表
        function renderUserItems(items) {
            const container = document.getElementById('user-items-container');

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-store"></i>
                        <h3>暂无商品</h3>
                        <p>该用户还没有上架任何商品</p>
                    </div>
                `;
                return;
            }

            const itemsHtml = items.map(item => {
                const typeTagsHtml = item.types ? item.types.map(type =>
                    `<span class="mall-item-type">${type}</span>`
                ).join('') : `<span class="mall-item-type">${item.type}</span>`;

                return `
                    <div class="mall-item" onclick="showItemDetail('${item.id}')">
                        <img src="${item.image}" alt="${item.title}" class="mall-item-image">
                        <div class="mall-item-content">
                            <h3 class="mall-item-title">${item.title}</h3>
                            <div class="mall-item-details">
                                <div class="mall-item-row mall-item-price-row">
                                    <span class="mall-item-price">¥${(item.price / 100).toFixed(2)}</span>
                                    <div class="mall-item-types">${typeTagsHtml}</div>
                                </div>
                                <div class="mall-item-row mall-item-info-row">
                                    <span class="mall-item-server-info">区服：${item.server}</span>
                                    <span class="mall-item-contact-info" onclick="event.stopPropagation(); copyContactInfo('${item.contact}')">联系方式：${item.contact}</span>
                                </div>
                                <div class="mall-item-row mall-item-stats-row">
                                    <span class="mall-item-views">浏览量：${item.viewCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = itemsHtml;
        }

        // 渲染用户商品页面
        function renderUserItemsPage(user, items) {
            // 更新用户信息
            const avatarElement = document.getElementById('user-items-avatar');
            if (user.avatar && user.avatar !== 'https://via.placeholder.com/100x100/3498db/ffffff?text=头像') {
                // 如果有自定义头像，显示图片
                avatarElement.innerHTML = `<img src="${user.avatar}" alt="头像" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                // 否则显示首字母
                const nickname = user.nickname || user.platform_name || '用户';
                avatarElement.textContent = nickname.charAt(0).toUpperCase();
                avatarElement.style.backgroundImage = 'none';
            }
            document.getElementById('user-items-nickname').textContent = user.nickname || user.platform_name || '用户';
            document.getElementById('user-items-id').textContent = `ID: ${user.id || user.user_id || 'N/A'}`;

            // 渲染商品列表
            const container = document.getElementById('user-items-container');

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-store"></i>
                        <h3>暂无商品</h3>
                        <p>该用户还没有上架任何商品</p>
                    </div>
                `;
                return;
            }

            const itemsHtml = items.map(item => {
                const typeTagsHtml = item.types ? item.types.map(type =>
                    `<span class="mall-item-type">${type}</span>`
                ).join('') : `<span class="mall-item-type">${item.type}</span>`;

                return `
                    <div class="mall-item" onclick="showItemDetail('${item.id}')">
                        <img src="${item.image}" alt="${item.title}" class="mall-item-image">
                        <div class="mall-item-content">
                            <h3 class="mall-item-title">${item.title}</h3>
                            <div class="mall-item-details">
                                <div class="mall-item-row mall-item-price-row">
                                    <span class="mall-item-price">¥${(item.price / 100).toFixed(2)}</span>
                                    <div class="mall-item-types">${typeTagsHtml}</div>
                                </div>
                                <div class="mall-item-row mall-item-info-row">
                                    <span class="mall-item-server-info">区服：${item.server}</span>
                                    <span class="mall-item-contact-info" onclick="event.stopPropagation(); copyContactInfo('${item.contact}')">联系方式：${item.contact}</span>
                                </div>
                                <div class="mall-item-row mall-item-stats-row">
                                    <span class="mall-item-views">浏览量：${item.viewCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = itemsHtml;
        }

        // 商品续时相关变量
        let extendItemData = null;

        // 显示续时模态框
        async function showExtendModal(itemId, title) {
            try {
                // 获取上架费用
                const feeResponse = await fetch('/api/config/listing-fee');
                const feeData = await feeResponse.json();
                const dailyFee = feeData.success ? feeData.fee : 1;

                extendItemData = { itemId, title };

                document.getElementById('extend-item-title').textContent = title;
                document.getElementById('extend-daily-fee').textContent = dailyFee;
                document.getElementById('extend-total-fee').textContent = dailyFee * 7;

                // 监听天数变化
                const daysInput = document.getElementById('extend-days');
                daysInput.addEventListener('input', function() {
                    const days = parseInt(this.value) || 1;
                    const totalFee = dailyFee * days;
                    document.getElementById('extend-total-fee').textContent = totalFee;
                });

                document.getElementById('extend-modal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('获取上架费用失败:', error);
                showNotification('获取上架费用失败', 'error');
            }
        }

        // 关闭续时模态框
        function closeExtendModal() {
            document.getElementById('extend-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
            extendItemData = null;
        }

        // 确认续时
        async function confirmExtend() {
            if (!extendItemData || !userToken) {
                showNotification('请先登录', 'error');
                return;
            }

            const days = parseInt(document.getElementById('extend-days').value);
            if (!days || days < 1 || days > 30) {
                showNotification('请输入有效的续时天数（1-30天）', 'error');
                return;
            }

            try {
                const response = await fetch('/api/mall/extend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        itemId: extendItemData.itemId,
                        days: days
                    })
                });

                const data = await response.json();

                if (data.success) {
                    closeExtendModal();

                    // 先刷新数据，再显示成功提示
                    try {
                        // 等待一小段时间确保文件写入完成
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // 刷新商品列表
                        await loadMyItems();

                        // 刷新用户信息
                        if (typeof loadUserInfo === 'function') {
                            await loadUserInfo();
                        }

                        // 更新当前用户的火币显示
                        if (currentUser && data.remainingCoins !== undefined) {
                            currentUser.coins = data.remainingCoins;
                            updateUserDisplay();
                        }

                        // 数据刷新完成后显示成功提示
                        showNotification(data.message || '续时成功', 'success');
                    } catch (refreshError) {
                        console.error('刷新数据失败:', refreshError);
                        showNotification('续时成功，但数据刷新失败，请手动刷新页面', 'success');
                    }
                } else {
                    showNotification(data.message || '续时失败', 'error');
                }
            } catch (error) {
                console.error('续时失败:', error);
                showNotification('续时失败，请重试', 'error');
            }
        }

        // 测试用户信息API
        async function testUserInfoAPI(username) {
            console.log('测试用户信息API，用户名:', username);
            try {
                const response = await fetch(`/api/user/public-info?username=${encodeURIComponent(username)}`);
                console.log('API响应状态:', response.status);
                console.log('API响应头:', [...response.headers.entries()]);

                const text = await response.text();
                console.log('API响应原始文本:', text);

                try {
                    const json = JSON.parse(text);
                    console.log('API响应JSON:', json);
                } catch (e) {
                    console.error('解析JSON失败:', e);
                }
            } catch (error) {
                console.error('API请求失败:', error);
            }
        }

        // 检查HTTPS并自动跳转到HTTP
        function checkHttpsAndRedirect() {
            // 检查当前协议是否为HTTPS
            if (window.location.protocol === 'https:') {
                try {
                    // 构建HTTP版本的URL
                    const httpUrl = window.location.href.replace('https:', 'http:');

                    // 自动跳转到HTTP版本
                    window.location.replace(httpUrl);
                } catch (error) {
                    console.log('无法自动跳转到HTTP版本:', error);
                    // 如果跳转失败，不做任何处理，继续使用HTTPS
                }
            }
        }

        // 检查域名并自动跳转到代练日志查询
        function checkDomainAndRedirect() {
            const currentDomain = window.location.hostname;
            const currentProtocol = window.location.protocol;
            const fullDomain = `${currentProtocol}//${currentDomain}`;

            // 检查是否为指定域名
            if (fullDomain === 'http://log.tsqt.top' || currentDomain === 'log.tsqt.top') {
                // 延迟一点时间确保页面完全加载
                setTimeout(() => {
                    // 切换到工具页面
                    showPage('tools');

                    // 展开代练日志查询工具
                    setTimeout(() => {
                        const trainingLogTool = document.getElementById('training-log-content');
                        const trainingLogToggle = document.getElementById('training-log-toggle');

                        if (trainingLogTool && trainingLogToggle) {
                            // 展开工具
                            trainingLogTool.style.display = 'block';
                            trainingLogToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';

                            // 滚动到代练日志查询工具位置
                            const trainingLogCard = trainingLogTool.closest('.card');
                            if (trainingLogCard) {
                                trainingLogCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    }, 500);
                }, 100);
            }
        }

        // 页面加载时检查分享链接
        document.addEventListener('DOMContentLoaded', function() {
            // 检查HTTPS并自动跳转到HTTP
            checkHttpsAndRedirect();

            handleShareLink();
            handleUserShareLink();

            // 检查域名是否为log.tsqt.top，如果是则自动跳转到代练日志查询
            checkDomainAndRedirect();

            // 如果URL中有v参数，测试API
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('v');
            if (username) {
                setTimeout(() => testUserInfoAPI(username), 1000);
            }

            // 添加调试信息
            console.log('页面加载完成，当前URL:', window.location.href);
            console.log('URL参数:', Object.fromEntries(urlParams.entries()));
        });

