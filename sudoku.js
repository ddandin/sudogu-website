class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.selectedCell = null;
        this.difficulty = 'easy';
        this.mistakes = 0;
        this.hintsUsed = 0;
        this.hintsRemaining = 3; // Max 3 hints per game
        this.timer = 0;
        this.timerInterval = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.redoHistory = [];
        this.showErrors = true;
        this.selectedDog = null;
        this.gameJustStarted = true;
        this.isPaused = false;
        this.gameWon = false; // Track if game has been won to prevent timer restart
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;

        // Language system
        this.currentLanguage = 'en';
        this.translations = this.getTranslations();

        // Notes mode for marking possible dogs (max 3 per cell)
        this.notesMode = false;
        this.eraseMode = false; // Mode for erasing notes one by one
        this.notes = []; // 9x9 array of arrays containing note numbers

        // Dynamic dog loading - will be populated by loadAllDogs()
        this.allBreeds = [];
        this.allBreedImages = [];
        this.allSleepImages = [];

        // Current game's selected 9 dogs (will be set when game starts)
        this.breeds = [];
        this.breedImages = [];
        this.sleepImages = [];

        // Favorite dog lock system
        this.favoriteDog = null; // Index in allBreeds array (null = no favorite selected)
        this.favoriteDogAtGameStart = null; // Track what favorite was when current game started

        // Dog loading status
        this.dogsLoaded = false;

        // Sound settings
        this.soundEnabled = localStorage.getItem('sudoku-sound') !== 'false'; // Default to true

        // Animation settings
        this.animationEnabled = localStorage.getItem('sudoku-animation') !== 'false'; // Default to true

        // Hint system - two-stage: highlight first, fill on second tap
        this.hintCell = null; // { row, col, answer } - the currently highlighted hint cell

        // Audio context for sounds
        this.correctSound = this.createSound(800, 0.1, 'sine');
        this.errorSound = this.createSound(200, 0.2, 'sawtooth');

        // Listen for resize events to update mobile state
        window.addEventListener('resize', () => {
            this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        });

        this.init();
    }

    getTranslations() {
        return {
            en: {
                title: "Sudogu - Dog Sudoku Game",
                dragADog: "Drag a Dog",
                selectDog: "Select a Dog",
                newGame: "New Game",
                howToPlay: "How to Play",
                leaderboard: "Leaderboard",
                aboutUs: "About Us",
                theme: "Theme",
                favoriteDog: "Favorite Dog",
                language: "Language",
                noFavorite: "No Favorite (Random)",
                favHint: "Your favorite will appear in every game!",
                mistakes: "Mistakes",
                notes: "Notes",
                erase: "Erase",
                hint: "Hint",
                restartGame: "Restart Game",
                pause: "Pause",
                resume: "Resume",
                time: "Time",
                showTimer: "Show Timer",
                timer: "Timer",
                easy: "Easy",
                medium: "Medium",
                hard: "Hard",
                classic: "Classic",
                darkMode: "Dark Mode",
                mars: "Mars (Recommended)",
                minimalist: "Minimalist",
                eyeRest: "Eye Resting",
                oceanBreeze: "Ocean Breeze",
                forest: "Forest",
                sunset: "Sunset",
                // How to Play Modal
                howToPlayTitle: "How to Play Sudogu",
                howToPlaySubtitle: "",
                howToPlayStep1: "Fill the board by placing different dogs in every 3×3 box, row, and column.",
                howToPlayStep2: "Choose a dog then tap an empty cell to place it. (You can also tap a cell first, then choose a dog.)",
                howToPlayStep3: "To remove an incorrectly placed dog, tap the placed dog once.",
                howToPlayStep4: "Open Notes to mark possible dogs for a cell.",
                howToPlayStep5: "Use the Erase button to clear notes.",
                howToPlayHaveFun: "Have fun!",
                // Win Modal
                congratulations: "Congratulations!",
                enterName: "Enter your name for the leaderboard:",
                playerNamePlaceholder: "Your name",
                submitScore: "Submit Score",
                skip: "Skip",
                // About Us Modal
                founderCEO: "Founder & CEO",
                itSupport: "IT Support",
                emotionalSupport: "Emotional Support & Dog Resources Manager",
                // Main Menu
                gameSubtitle: "Dog Sudoku Puzzle Game",
                continueGame: "Continue",
                difficulty: "Difficulty",
                backToMainMenu: "Back to Main Menu",
                restart: "Restart",
                // Leaderboard
                loadingScores: "Loading scores...",
                noScores: "No scores yet. Be the first!"
            },
            tr: {
                title: "Sudogu - Köpek Sudoku Oyunu",
                dragADog: "Bir Köpek Seç",
                selectDog: "Köpek Seç",
                newGame: "Yeni Oyun",
                howToPlay: "Nasıl Oynanır",
                leaderboard: "Sıralama Tablosu",
                aboutUs: "Hakkımızda",
                theme: "Tema",
                favoriteDog: "Favori Köpek",
                language: "Dil",
                noFavorite: "Favori Yok (Rastgele)",
                favHint: "Favori köpeğiniz her oyunda görünecek!",
                mistakes: "Hatalar",
                notes: "Notlar",
                erase: "Sil",
                hint: "İpucu",
                restartGame: "Oyunu Yeniden Başlat",
                pause: "Duraklat",
                resume: "Devam Et",
                time: "Süre",
                showTimer: "Zamanlayıcıyı Göster",
                timer: "Zamanlayıcı",
                easy: "Kolay",
                medium: "Orta",
                hard: "Zor",
                classic: "Klasik",
                darkMode: "Karanlık Mod",
                mars: "Mars (Önerilen)",
                minimalist: "Minimalist",
                eyeRest: "Göz Dinlendirme",
                oceanBreeze: "Okyanus Esintisi",
                forest: "Orman",
                sunset: "Gün Batımı",
                // How to Play Modal
                howToPlayTitle: "Sudogu Nasıl Oynanır",
                howToPlaySubtitle: "Her 3 × 3 seti farklı köpeklerle doldurun.",
                howToPlayStep1: "Alttaki bir köpeği seçin, ardından boş bir hücreye dokunarak yerleştirin.",
                howToPlayStep2: "Bir köpeği yerleştirdikten sonra, başka birini yerleştirmek için tekrar seçmelisiniz.",
                howToPlayStep3: "Tahtayı tamamlamak için tüm hücreleri doldurun.",
                howToPlayStep4: "Bir hata yaparsanız, yerleştirilmiş bir köpeği kaldırmak için bir kez dokunun.",
                howToPlayStep5: "Köpekler aynı set, satır veya sütunda tekrar edemez.",
                howToPlayHaveFun: "İyi eğlenceler!",
                // Win Modal
                congratulations: "Tebrikler!",
                enterName: "Sıralama tablosu için adınızı girin:",
                playerNamePlaceholder: "Adınız",
                submitScore: "Puanı Gönder",
                skip: "Geç",
                // About Us Modal
                founderCEO: "Kurucu & CEO",
                itSupport: "IT Destek",
                emotionalSupport: "Duygusal Destek & Köpek Kaynakları Müdürü",
                // Main Menu
                gameSubtitle: "Köpek Sudoku Bulmaca Oyunu",
                continueGame: "Devam Et",
                difficulty: "Zorluk",
                backToMainMenu: "Ana Menüye Dön",
                restart: "Yeniden Başlat",
                // Leaderboard
                loadingScores: "Skorlar yükleniyor...",
                noScores: "Henüz skor yok. İlk sen ol!"
            },
            nl: {
                title: "Sudogu - Honden Sudoku Spel",
                dragADog: "Sleep een Hond",
                selectDog: "Selecteer een Hond",
                newGame: "Nieuw Spel",
                howToPlay: "Hoe te Spelen",
                leaderboard: "Klassement",
                aboutUs: "Over Ons",
                theme: "Thema",
                favoriteDog: "Favoriete Hond",
                language: "Taal",
                noFavorite: "Geen Favoriet (Willekeurig)",
                favHint: "Je favoriet verschijnt in elk spel!",
                mistakes: "Fouten",
                notes: "Notities",
                erase: "Wissen",
                hint: "Hint",
                restartGame: "Herstart Spel",
                pause: "Pauzeer",
                resume: "Hervat",
                time: "Tijd",
                showTimer: "Toon Timer",
                timer: "Timer",
                easy: "Gemakkelijk",
                medium: "Gemiddeld",
                hard: "Moeilijk",
                classic: "Klassiek",
                darkMode: "Donkere Modus",
                mars: "Mars (Aanbevolen)",
                minimalist: "Minimalistisch",
                eyeRest: "Oogrust",
                oceanBreeze: "Oceaan Bries",
                forest: "Bos",
                sunset: "Zonsondergang",
                // How to Play Modal
                howToPlayTitle: "Hoe Sudogu te Spelen",
                howToPlaySubtitle: "Vul elke 3 × 3 set met verschillende honden.",
                howToPlayStep1: "Selecteer een hond van onderaf en tik op een lege cel om deze te plaatsen.",
                howToPlayStep2: "Na het plaatsen van een hond, moet je opnieuw selecteren om er nog een te plaatsen.",
                howToPlayStep3: "Vul alle cellen om het bord te voltooien.",
                howToPlayStep4: "Als je een fout maakt, tik eenmaal om een geplaatste hond te verwijderen.",
                howToPlayStep5: "Honden kunnen niet herhalen in dezelfde set, rij of kolom.",
                howToPlayHaveFun: "Veel plezier!",
                // Win Modal
                congratulations: "Gefeliciteerd!",
                enterName: "Voer je naam in voor het klassement:",
                playerNamePlaceholder: "Je naam",
                submitScore: "Score Indienen",
                skip: "Overslaan",
                // About Us Modal
                founderCEO: "Oprichter & CEO",
                itSupport: "IT Ondersteuning",
                emotionalSupport: "Emotionele Ondersteuning & Honden Bronnen Manager",
                // Main Menu
                gameSubtitle: "Honden Sudoku Puzzelspel",
                continueGame: "Doorgaan",
                difficulty: "Moeilijkheidsgraad",
                backToMainMenu: "Terug naar Hoofdmenu",
                restart: "Opnieuw Starten",
                // Leaderboard
                loadingScores: "Scores laden...",
                noScores: "Nog geen scores. Wees de eerste!"
            },
            zh: {
                title: "狗狗数独游戏",
                dragADog: "拖动狗狗",
                selectDog: "选择狗狗",
                newGame: "新游戏",
                howToPlay: "如何玩",
                leaderboard: "排行榜",
                aboutUs: "关于我们",
                theme: "主题",
                favoriteDog: "最喜欢的狗",
                language: "语言",
                noFavorite: "无最爱（随机）",
                favHint: "您最喜欢的狗会出现在每场游戏中！",
                mistakes: "错误",
                notes: "笔记",
                erase: "擦除",
                hint: "提示",
                restartGame: "重新开始",
                pause: "暂停",
                resume: "继续",
                time: "时间",
                showTimer: "显示计时器",
                timer: "计时器",
                easy: "简单",
                medium: "中等",
                hard: "困难",
                classic: "经典",
                darkMode: "暗黑模式",
                mars: "火星 (推荐)",
                minimalist: "极简",
                eyeRest: "护眼",
                oceanBreeze: "海洋微风",
                forest: "森林",
                sunset: "日落",
                // How to Play Modal
                howToPlayTitle: "如何玩狗狗数独",
                howToPlaySubtitle: "用不同的狗填充每个 3 × 3 组。",
                howToPlayStep1: "从底部选择一只狗，然后点击空单元格放置它。",
                howToPlayStep2: "放置一只狗后，必须再次选择才能放置另一只。",
                howToPlayStep3: "填充所有单元格以完成棋盘。",
                howToPlayStep4: "如果犯错，点击一次即可删除已放置的狗。",
                howToPlayStep5: "狗不能在同一组、行或列中重复。",
                howToPlayHaveFun: "玩得开心！",
                // Win Modal
                congratulations: "恭喜！",
                enterName: "输入您的名字以显示在排行榜：",
                playerNamePlaceholder: "您的名字",
                submitScore: "提交分数",
                skip: "跳过",
                // Leaderboard
                loadingScores: "加载分数中...",
                noScores: "还没有分数。成为第一个！",
                // About Us Modal
                founderCEO: "创始人兼CEO",
                itSupport: "IT支持",
                emotionalSupport: "情感支持和狗资源经理",
                // Main Menu
                gameSubtitle: "狗狗数独拼图游戏",
                continueGame: "继续",
                difficulty: "难度",
                backToMainMenu: "返回主菜单",
                restart: "重新开始"
            },
            ja: {
                title: "スドーグ - 犬数独ゲーム",
                dragADog: "犬をドラッグ",
                selectDog: "犬を選択",
                newGame: "新しいゲーム",
                howToPlay: "遊び方",
                leaderboard: "リーダーボード",
                aboutUs: "私たちについて",
                theme: "テーマ",
                favoriteDog: "お気に入りの犬",
                language: "言語",
                noFavorite: "お気に入りなし（ランダム）",
                favHint: "お気に入りの犬が毎回表示されます！",
                mistakes: "ミス",
                notes: "メモ",
                erase: "消去",
                hint: "ヒント",
                restartGame: "ゲームを再開",
                pause: "一時停止",
                resume: "再開",
                time: "時間",
                showTimer: "タイマーを表示",
                timer: "タイマー",
                easy: "簡単",
                medium: "普通",
                hard: "難しい",
                classic: "クラシック",
                darkMode: "ダークモード",
                mars: "火星 (おすすめ)",
                minimalist: "ミニマル",
                eyeRest: "目の休息",
                oceanBreeze: "オーシャンブリーズ",
                forest: "森",
                sunset: "夕日",
                // How to Play Modal
                howToPlayTitle: "スドーグの遊び方",
                howToPlaySubtitle: "各3×3のセットを異なる犬で埋めます。",
                howToPlayStep1: "下から犬を選択し、空のセルをタップして配置します。",
                howToPlayStep2: "犬を配置した後、別の犬を配置するには再度選択する必要があります。",
                howToPlayStep3: "すべてのセルを埋めてボードを完成させます。",
                howToPlayStep4: "間違えた場合は、一度タップして配置した犬を削除します。",
                howToPlayStep5: "犬は同じセット、行、列で繰り返すことはできません。",
                howToPlayHaveFun: "楽しんでください！",
                // Win Modal
                congratulations: "おめでとうございます！",
                enterName: "リーダーボードに名前を入力：",
                playerNamePlaceholder: "あなたの名前",
                submitScore: "スコアを送信",
                skip: "スキップ",
                // Leaderboard
                loadingScores: "スコアを読み込み中...",
                noScores: "まだスコアがありません。最初の一人になろう！",
                // About Us Modal
                founderCEO: "創設者＆CEO",
                itSupport: "ITサポート",
                emotionalSupport: "感情サポート＆犬リソースマネージャー",
                // Main Menu
                gameSubtitle: "犬数独パズルゲーム",
                continueGame: "続ける",
                difficulty: "難易度",
                backToMainMenu: "メインメニューに戻る",
                restart: "再スタート"
            }
        };
    }

    createSound(frequency, duration, type = 'sine') {
        return () => {
            if (!this.soundEnabled) return; // Check if sound is enabled

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    async init() {
        this.loadTheme();
        this.loadLanguage();

        // Load all available dogs from photos folder
        await this.loadAllDogs();

        this.loadFavoriteDog();
        this.setupEventListeners();
        this.setupMainMenu();
        this.updateHintCounter();

        // Initialize timer display visibility based on checkbox state
        const showTimerCheckbox = document.getElementById('show-timer');
        const timeDisplay = document.querySelector('.time-display');
        if (showTimerCheckbox && !showTimerCheckbox.checked) {
            timeDisplay.classList.add('hidden');
        }

        // Don't auto-generate game, wait for user to start from main menu
        // Show main menu instead
        this.showMainMenu();
    }

    async loadAllDogs() {
        // Manually configured dog list - edit this array to add/remove dogs
        const dogNames = [
            'Akhilleus', 'Ares', 'Aria', 'Co', 'Cookie', 'George', 'Gofret',
            'Hera', 'Kozmo', 'Leka', 'Lolo', 'Maya', 'Rio',
            'Roxy', 'Skipper', 'Tony', 'Vera'
        ];

        // Load each dog's images
        const loadedDogs = [];

        for (const dogName of dogNames) {
            const regularImage = `photos/${dogName}.png`;
            const sleepImage = `photos/sleep/${dogName}-sleep.png`;

            // Verify images exist by attempting to load them
            try {
                const imgTest = new Image();
                const loadPromise = new Promise((resolve) => {
                    imgTest.onload = () => resolve(true);
                    imgTest.onerror = () => resolve(false);
                });
                imgTest.src = regularImage;
                const exists = await loadPromise;

                if (exists) {
                    loadedDogs.push({
                        name: dogName,
                        image: regularImage,
                        sleepImage: sleepImage
                    });
                } else {
                    console.warn(`⚠️ Dog "${dogName}" image not found at ${regularImage}`);
                }
            } catch (e) {
                console.log(`Skipping ${dogName} - image not found`);
            }
        }

        // Populate the arrays
        this.allBreeds = loadedDogs.map(d => d.name);
        this.allBreedImages = loadedDogs.map(d => d.image);
        this.allSleepImages = loadedDogs.map(d => d.sleepImage);

        this.dogsLoaded = true;

        console.log(`✅ Loaded ${this.allBreeds.length} dogs:`, this.allBreeds.join(', '));

        // Update favorite dog dropdown
        this.updateFavoriteDogDropdown();
    }

    updateFavoriteDogDropdown() {
        const dropdownOptions = document.getElementById('favorite-dog-options');
        const dropdownSelected = document.getElementById('favorite-dog-selected');
        if (!dropdownOptions || !dropdownSelected) return;

        // Get saved selection
        const savedValue = localStorage.getItem('sudoku-favorite-dog') || 'none';

        // Clear existing options
        dropdownOptions.innerHTML = '';

        // Add "No Favorite" option
        const noneOption = document.createElement('div');
        noneOption.className = 'dropdown-option';
        noneOption.dataset.value = 'none';
        noneOption.textContent = this.translations[this.currentLanguage].noFavorite;
        if (savedValue === 'none') {
            noneOption.classList.add('selected');
        }
        dropdownOptions.appendChild(noneOption);

        // Add all loaded dogs with images
        this.allBreeds.forEach((dogName, index) => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.dataset.value = index;

            // Create dog image
            const img = document.createElement('img');
            img.src = this.allBreedImages[index];
            img.className = 'dropdown-dog-img';
            img.alt = dogName;

            // Create dog name text
            const nameSpan = document.createElement('span');
            nameSpan.textContent = dogName;

            option.appendChild(img);
            option.appendChild(nameSpan);

            // Mark as selected if this is the saved value
            if (savedValue !== 'none' && parseInt(savedValue) === index) {
                option.classList.add('selected');
            }

            dropdownOptions.appendChild(option);
        });

        // Update the displayed selection
        this.updateFavoriteDogDisplay();
    }

    updateFavoriteDogDisplay() {
        const dropdownSelected = document.getElementById('favorite-dog-selected');
        if (!dropdownSelected) return;

        const dropdownText = dropdownSelected.querySelector('.dropdown-text');
        if (!dropdownText) return;

        const t = this.translations[this.currentLanguage];

        if (this.favoriteDog === null) {
            dropdownText.innerHTML = t.noFavorite;
        } else {
            const dogName = this.allBreeds[this.favoriteDog];
            const dogImage = this.allBreedImages[this.favoriteDog];

            dropdownText.innerHTML = `
                <img src="${dogImage}" class="dropdown-dog-img" alt="${dogName}">
                <span>${dogName}</span>
            `;
        }
    }

    loadTheme() {
        // Load saved game theme from localStorage, default to Mars
        const savedTheme = localStorage.getItem('sudoku-theme') || 'space';
        this.gameTheme = savedTheme;

        // Update theme selector in hamburger menu
        const menuThemeSelect = document.getElementById('menu-theme-select');
        if (menuThemeSelect) {
            menuThemeSelect.value = savedTheme;
        }

        // Apply Mars theme for main menu on initial load
        this.applyMainMenuTheme();
    }

    loadFavoriteDog() {
        // Load saved favorite dog from localStorage
        const saved = localStorage.getItem('sudoku-favorite-dog');
        if (saved && saved !== 'none') {
            this.favoriteDog = parseInt(saved);
        } else {
            this.favoriteDog = null;
        }

        // Update UI display
        this.updateFavoriteDogDisplay();
    }

    applyTheme(themeName, forceApply = false) {
        // Store the game theme
        this.gameTheme = themeName;
        localStorage.setItem('sudoku-theme', themeName);

        // Update theme selector in hamburger menu
        const menuThemeSelect = document.getElementById('menu-theme-select');
        if (menuThemeSelect) {
            menuThemeSelect.value = themeName;
        }

        // Only apply theme to body if we're not in main menu (or if forced)
        const mainMenu = document.getElementById('main-menu');
        const isMainMenuVisible = mainMenu && !mainMenu.classList.contains('hidden');

        if (!isMainMenuVisible || forceApply) {
            document.body.setAttribute('data-theme', themeName);
        }
    }

    applyMainMenuTheme() {
        // Main menu always uses Mars theme
        document.body.setAttribute('data-theme', 'space');
    }

    applyGameTheme() {
        // Apply the user's selected game theme
        const savedTheme = this.gameTheme || localStorage.getItem('sudoku-theme') || 'default';
        document.body.setAttribute('data-theme', savedTheme);
    }

    loadLanguage() {
        // Load saved language from localStorage
        const savedLanguage = localStorage.getItem('sudoku-language') || 'en';
        this.currentLanguage = savedLanguage;

        // Update language selector in hamburger menu
        const menuLanguageSelect = document.getElementById('menu-language-select');
        if (menuLanguageSelect) {
            menuLanguageSelect.value = savedLanguage;
        }

        // Update UI with loaded language
        this.updateUILanguage();
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;

        // Update language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = lang;
        }

        // Save to localStorage
        localStorage.setItem('sudoku-language', lang);

        // Update all UI text
        this.updateUILanguage();
    }

    updateUILanguage() {
        const t = this.translations[this.currentLanguage];

        // Update document title
        document.title = t.title;

        // Update header
        const header = document.querySelector('.game-header h1');
        if (header) header.textContent = '🐾 Sudogu 🐾';

        // Update panel title
        const panelTitle = document.querySelector('.panel-title');
        if (panelTitle) panelTitle.textContent = t.dragADog;

        // Update menu items
        const newGameBtn = document.querySelector('.new-game-menu-btn');
        if (newGameBtn) {
            const icon = newGameBtn.querySelector('.menu-icon');
            newGameBtn.innerHTML = '';
            if (icon) newGameBtn.appendChild(icon.cloneNode(true));
            newGameBtn.append(t.newGame);
        }

        const howToPlayBtn = document.querySelector('.how-to-play-menu-btn');
        if (howToPlayBtn) {
            const icon = howToPlayBtn.querySelector('.menu-icon');
            howToPlayBtn.innerHTML = '';
            if (icon) howToPlayBtn.appendChild(icon.cloneNode(true));
            howToPlayBtn.append(t.howToPlay);
        }

        const leaderboardMenuBtn = document.querySelector('.leaderboard-menu-btn');
        if (leaderboardMenuBtn) {
            const icon = leaderboardMenuBtn.querySelector('.menu-icon');
            leaderboardMenuBtn.innerHTML = '';
            if (icon) leaderboardMenuBtn.appendChild(icon.cloneNode(true));
            leaderboardMenuBtn.append(t.leaderboard);
        }

        // Update menu labels
        const menuLabels = document.querySelectorAll('.menu-label');
        menuLabels.forEach(label => {
            const text = label.textContent.trim();
            if (text === 'Theme' || text === 'Tema' || text === 'Thema' || text === '主题' || text === 'テーマ') {
                label.textContent = t.theme;
            } else if (text === 'Favorite Dog' || text === 'Favori Köpek' || text === 'Favoriete Hond' || text === '最喜欢的狗' || text === 'お気に入りの犬') {
                label.textContent = t.favoriteDog;
            } else if (text === 'Language' || text === 'Dil' || text === 'Taal' || text === '语言' || text === '言語') {
                label.textContent = t.language;
            }
        });

        // Update theme options
        const themeSelects = [document.getElementById('theme-select'), document.getElementById('theme-select-menu')];
        themeSelects.forEach(select => {
            if (select) {
                const options = select.querySelectorAll('option');
                options.forEach(option => {
                    const value = option.value;
                    if (t[value]) {
                        option.textContent = t[value];
                    }
                });
            }
        });

        // Update difficulty options
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            const options = difficultySelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                if (t[value]) {
                    option.textContent = t[value];
                }
            });
        }

        // Update theme dropdown options
        const themeSelect = document.getElementById('theme-select-menu');
        if (themeSelect) {
            const themeMap = {
                'default': 'classic',
                'dark': 'darkMode',
                'space': 'mars',
                'minimalist': 'minimalist',
                'eye-rest': 'eyeRest',
                'ocean': 'oceanBreeze',
                'forest': 'forest',
                'sunset': 'sunset'
            };
            const options = themeSelect.querySelectorAll('option');
            options.forEach(option => {
                const translationKey = themeMap[option.value];
                if (translationKey && t[translationKey]) {
                    option.textContent = t[translationKey];
                }
            });
        }

        // Update main menu elements
        const gameSubtitle = document.querySelector('.game-subtitle');
        if (gameSubtitle) gameSubtitle.textContent = t.gameSubtitle;

        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            const textSpan = startGameBtn.querySelector('.menu-btn-text');
            if (textSpan) textSpan.textContent = t.newGame;
        }

        const continueGameBtn = document.getElementById('continue-game-btn');
        if (continueGameBtn) {
            const textSpan = continueGameBtn.querySelector('.menu-btn-text');
            if (textSpan) textSpan.textContent = t.continueGame;
        }

        const howToPlayMainBtn = document.getElementById('how-to-play-main-btn');
        if (howToPlayMainBtn) {
            const textSpan = howToPlayMainBtn.querySelector('.menu-btn-text');
            if (textSpan) textSpan.textContent = t.howToPlay;
        }

        const leaderboardMainBtn = document.getElementById('leaderboard-main-btn');
        if (leaderboardMainBtn) {
            const textSpan = leaderboardMainBtn.querySelector('.menu-btn-text');
            if (textSpan) textSpan.textContent = t.leaderboard;
        }

        // Update main menu labels
        const mainMenuLabels = document.querySelectorAll('.main-menu-label');
        mainMenuLabels.forEach(label => {
            const text = label.textContent.trim();
            if (text === 'Difficulty' || text === 'Zorluk' || text === 'Moeilijkheidsgraad' || text === '难度' || text === '難易度') {
                label.textContent = t.difficulty;
            } else if (text === 'Theme' || text === 'Tema' || text === 'Thema' || text === '主题' || text === 'テーマ') {
                label.textContent = t.theme;
            } else if (text === 'Language' || text === 'Dil' || text === 'Taal' || text === '语言' || text === '言語') {
                label.textContent = t.language;
            }
        });

        // Update difficulty buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            const difficulty = btn.dataset.difficulty;
            if (difficulty && t[difficulty]) {
                btn.textContent = t[difficulty];
            }
        });

        // Update hamburger menu theme dropdown
        const menuThemeSelect = document.getElementById('menu-theme-select');
        if (menuThemeSelect) {
            const themeMap = {
                'default': 'classic',
                'dark': 'darkMode',
                'space': 'mars',
                'minimalist': 'minimalist',
                'ocean': 'oceanBreeze',
                'forest': 'forest',
                'sunset': 'sunset'
            };
            const options = menuThemeSelect.querySelectorAll('option');
            options.forEach(option => {
                const translationKey = themeMap[option.value];
                if (translationKey && t[translationKey]) {
                    option.textContent = t[translationKey];
                }
            });
        }

        // Update hamburger menu buttons
        const restartBtns = document.querySelectorAll('.restart-btn');
        restartBtns.forEach(btn => {
            const icon = btn.querySelector('.menu-icon');
            btn.innerHTML = '';
            if (icon) btn.appendChild(icon.cloneNode(true));
            btn.append(t.restart);
        });

        const backToMainMenuBtn = document.querySelector('.back-to-main-menu-btn');
        if (backToMainMenuBtn) {
            const icon = backToMainMenuBtn.querySelector('.menu-icon');
            backToMainMenuBtn.innerHTML = '';
            if (icon) backToMainMenuBtn.appendChild(icon.cloneNode(true));
            backToMainMenuBtn.append(t.backToMainMenu);
        }

        // Update mistakes label (desktop)
        const mistakesLabel = document.querySelector('.game-info .mistakes .label');
        if (mistakesLabel) mistakesLabel.textContent = `${t.mistakes}:`;

        // Update control labels (Notes, Erase, Mistakes)
        const controlLabels = document.querySelectorAll('.control-label');
        controlLabels.forEach(label => {
            const text = label.textContent.trim().toLowerCase();
            if (text === 'notes' || text === 'notlar' || text === 'notities' || text === '笔记' || text === 'メモ') {
                label.textContent = t.notes;
            } else if (text === 'erase' || text === 'sil' || text === 'wissen' || text === '擦除' || text === '消去') {
                label.textContent = t.erase;
            } else if (text === 'mistakes' || text === 'hatalar' || text === 'fouten' || text === '错误' || text === 'ミス') {
                label.textContent = t.mistakes;
            } else if (text === 'hint' || text === 'ipucu' || text === '提示' || text === 'ヒント') {
                label.textContent = t.hint;
            }
        });

        // Update toggle labels
        const timerLabel = document.querySelector('.timer-control-group .toggle-label');
        if (timerLabel) timerLabel.textContent = t.timer;

        const pauseLabel = document.querySelector('.pause-toggle .pause-label');
        if (pauseLabel) pauseLabel.textContent = this.isPaused ? t.resume : t.pause;

        // Update leaderboard button
        const leaderboardBtn = document.querySelector('.leaderboard-btn');
        if (leaderboardBtn) leaderboardBtn.textContent = t.leaderboard;

        // Update favorite dog hint
        const menuHint = document.querySelector('.menu-hint');
        if (menuHint) menuHint.textContent = t.favHint;

        // Update difficulty display
        this.updateDifficultyDisplay();

        // Update favorite dog dropdown options with new language
        this.updateFavoriteDogDropdown();

        // Update favorite dog display
        this.updateFavoriteDogDisplay();
    }

    updateDifficultyDisplay() {
        const t = this.translations[this.currentLanguage];
        const difficultyValue = document.getElementById('difficulty-value');
        const difficultyLabel = document.querySelector('.difficulty-label');

        if (difficultyValue) {
            // Get translated difficulty text
            const translatedDifficulty = t[this.difficulty] || this.difficulty;
            difficultyValue.textContent = translatedDifficulty;
        }

        if (difficultyLabel) {
            difficultyLabel.textContent = t.difficulty + ':';
        }
    }

    setupMainMenu() {
        const mainMenu = document.getElementById('main-menu');
        const startBtn = document.getElementById('start-game-btn');
        const continueBtn = document.getElementById('continue-game-btn');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        const howToPlayBtn = document.getElementById('how-to-play-main-btn');
        const leaderboardBtn = document.getElementById('leaderboard-main-btn');

        // Start new game
        startBtn?.addEventListener('click', () => {
            this.hideMainMenu();
            this.generateNewGame();
        });

        // Continue game (if exists)
        continueBtn?.addEventListener('click', () => {
            this.hideMainMenu();
        });

        // Difficulty selection
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
            });
        });

        // How to Play
        howToPlayBtn?.addEventListener('click', () => {
            this.showHowToPlay();
        });

        // Leaderboard
        leaderboardBtn?.addEventListener('click', () => {
            this.showLeaderboard(this.difficulty);
        });
    }

    showMainMenu() {
        const mainMenu = document.getElementById('main-menu');
        const continueBtn = document.getElementById('continue-game-btn');
        const gameLayout = document.querySelector('.game-layout');

        // Apply Mars theme for main menu
        this.applyMainMenuTheme();

        if (mainMenu) {
            mainMenu.classList.remove('hidden');
        }

        // Hide game layout when showing main menu
        if (gameLayout) {
            gameLayout.style.display = 'none';
        }

        // Show continue button if game is in progress
        if (continueBtn && !this.gameJustStarted && this.timer > 0) {
            continueBtn.style.display = 'flex';
        }
    }

    hideMainMenu() {
        const mainMenu = document.getElementById('main-menu');
        const gameLayout = document.querySelector('.game-layout');

        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }

        // Apply the user's selected game theme
        this.applyGameTheme();

        // Show game layout when hiding main menu
        if (gameLayout) {
            gameLayout.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sideMenu = document.getElementById('side-menu');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const menuOverlay = document.getElementById('menu-overlay');

        const openMenu = () => {
            sideMenu?.classList.add('open');
            menuOverlay?.classList.add('show');
        };

        const closeMenu = () => {
            sideMenu?.classList.remove('open');
            menuOverlay?.classList.remove('show');
        };

        hamburgerBtn?.addEventListener('click', openMenu);
        closeMenuBtn?.addEventListener('click', closeMenu);
        menuOverlay?.addEventListener('click', closeMenu);

        // Menu item buttons
        document.querySelector('.new-game-menu-btn')?.addEventListener('click', () => {
            this.generateNewGame();
            closeMenu();
        });

        document.querySelector('.how-to-play-menu-btn')?.addEventListener('click', () => {
            this.showHowToPlay();
            closeMenu();
        });

        document.querySelector('.leaderboard-menu-btn')?.addEventListener('click', () => {
            this.showLeaderboard('easy');
            closeMenu();
        });

        document.querySelector('.back-to-main-menu-btn')?.addEventListener('click', () => {
            this.showMainMenu();
            closeMenu();
        });

        // Theme selector in hamburger menu
        const menuThemeSelect = document.getElementById('menu-theme-select');
        if (menuThemeSelect) {
            menuThemeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        // Language selector in hamburger menu
        const menuLanguageSelect = document.getElementById('menu-language-select');
        if (menuLanguageSelect) {
            menuLanguageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Sound toggle in hamburger menu
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            // Set initial state from saved preference
            soundToggle.checked = this.soundEnabled;
            soundToggle.addEventListener('change', (e) => {
                this.soundEnabled = e.target.checked;
                localStorage.setItem('sudoku-sound', e.target.checked);
            });
        }

        // Animation toggle in hamburger menu
        const animationToggle = document.getElementById('animation-toggle');
        if (animationToggle) {
            // Set initial state from saved preference
            animationToggle.checked = this.animationEnabled;
            animationToggle.addEventListener('change', (e) => {
                this.animationEnabled = e.target.checked;
                localStorage.setItem('sudoku-animation', e.target.checked);
            });
        }

        // Favorite dog custom dropdown
        const dropdownSelected = document.getElementById('favorite-dog-selected');
        const dropdownOptions = document.getElementById('favorite-dog-options');

        if (dropdownSelected && dropdownOptions) {
            // Toggle dropdown on click
            dropdownSelected.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownSelected.classList.toggle('active');
                dropdownOptions.classList.toggle('show');
            });

            // Handle option selection
            dropdownOptions.addEventListener('click', (e) => {
                const option = e.target.closest('.dropdown-option');
                if (!option) return;

                const selectedValue = option.dataset.value;

                // Update all options' selected state
                dropdownOptions.querySelectorAll('.dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                // Update favorite dog
                if (selectedValue === 'none') {
                    this.favoriteDog = null;
                } else {
                    this.favoriteDog = parseInt(selectedValue);
                }

                // Save to localStorage
                localStorage.setItem('sudoku-favorite-dog', selectedValue);

                // Update display
                this.updateFavoriteDogDisplay();

                // Close dropdown
                dropdownSelected.classList.remove('active');
                dropdownOptions.classList.remove('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-dropdown')) {
                    dropdownSelected.classList.remove('active');
                    dropdownOptions.classList.remove('show');
                }
            });
        }

        // Difficulty dropdown (desktop)
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.generateNewGame();
            });
        }

        // Difficulty dropdown (mobile)
        const difficultySelectMobile = document.getElementById('difficulty-select-mobile');
        if (difficultySelectMobile) {
            difficultySelectMobile.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.generateNewGame();
            });
        }

        // Note: New game and How to Play buttons are only in hamburger menu now
        // Event listeners for those are set up in the hamburger menu section above

        // Modal close button and overlay click
        const modal = document.getElementById('how-to-play-modal');
        const closeBtn = modal?.querySelector('.modal-close');

        closeBtn?.addEventListener('click', () => {
            this.closeHowToPlay();
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeHowToPlay();
            }
        });

        // Leaderboard button
        document.querySelector('.leaderboard-btn')?.addEventListener('click', () => {
            this.showLeaderboard('easy');
        });

        // Leaderboard modal close
        const leaderboardModal = document.getElementById('leaderboard-modal');
        const leaderboardCloseBtn = leaderboardModal?.querySelector('.modal-close');

        leaderboardCloseBtn?.addEventListener('click', () => {
            leaderboardModal.classList.remove('show');
        });

        leaderboardModal?.addEventListener('click', (e) => {
            if (e.target === leaderboardModal) {
                leaderboardModal.classList.remove('show');
            }
        });

        // Leaderboard difficulty tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.showLeaderboard(e.target.dataset.difficulty);
            });
        });

        // Win modal close
        const winModal = document.getElementById('win-modal');
        const winCloseBtn = winModal?.querySelector('.modal-close');

        winCloseBtn?.addEventListener('click', () => {
            winModal.classList.remove('show');
        });

        winModal?.addEventListener('click', (e) => {
            if (e.target === winModal) {
                winModal.classList.remove('show');
            }
        });

        // Submit score button
        document.querySelector('.submit-score-btn')?.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name');
            const submitBtn = document.querySelector('.submit-score-btn');
            const trimmedName = nameInput.value.trim();

            // Prevent multiple submissions
            if (this.isSubmitting) return;

            // Validate name - must have at least 1 non-space character
            if (trimmedName.length === 0) {
                // Add shake animation to highlight the input
                nameInput.classList.add('shake-highlight');
                nameInput.focus();

                // Remove the class after animation completes
                setTimeout(() => {
                    nameInput.classList.remove('shake-highlight');
                }, 600);
                return;
            }

            // Disable button and show loading state
            this.isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.classList.add('submitting');

            this.submitScore(trimmedName);
            nameInput.value = '';
        });

        // Skip submit button
        document.querySelector('.skip-submit-btn')?.addEventListener('click', () => {
            winModal.classList.remove('show');
        });

        // Demo buttons
        document.getElementById('demo-correct-btn')?.addEventListener('click', () => {
            this.showCorrectMove();
        });

        document.getElementById('demo-wrong-btn')?.addEventListener('click', () => {
            this.showWrongMove();
        });

        document.getElementById('demo-reset-btn')?.addEventListener('click', () => {
            this.resetDemo();
        });

        // Restart button - attach to all instances (mobile + desktop)
        document.querySelectorAll('.restart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.restartGame();
                closeMenu();
            });
        });

        // Notes button - attach to all instances (mobile + desktop)
        document.querySelectorAll('.notes-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleNotesMode();
            });
        });

        // Erase notes button - attach to all instances (mobile + desktop)
        document.querySelectorAll('.erase-notes-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.eraseAllNotes();
            });
        });

        // Hint button - attach to all instances (mobile + desktop)
        document.querySelectorAll('.hint-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.useHint();
            });
        });

        // Pause toggle
        document.getElementById('pause-game')?.addEventListener('change', (e) => {
            this.togglePause(e.target.checked);
        });

        // Timer checkbox
        document.getElementById('show-timer').addEventListener('change', (e) => {
            const timeDisplay = document.querySelector('.time-display');
            if (e.target.checked) {
                timeDisplay.classList.remove('hidden');
            } else {
                timeDisplay.classList.add('hidden');
            }
        });

        // Dog item click and drag handlers
        document.querySelectorAll('.dog-item').forEach(item => {
            // Click handler
            item.addEventListener('click', (e) => {
                const dogItem = e.currentTarget;
                if (dogItem.classList.contains('completed')) return;

                // If clicking on already selected dog, deselect it
                if (dogItem.classList.contains('selected')) {
                    dogItem.classList.remove('selected');
                    this.selectedDog = null;
                    return;
                }

                // Remove previous selection and select this dog
                document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                dogItem.classList.add('selected');

                this.selectedDog = parseInt(dogItem.dataset.num);

                // If a cell is already selected, place the dog immediately (works on both mobile and desktop)
                if (this.selectedCell) {
                    const row = parseInt(this.selectedCell.dataset.row);
                    const col = parseInt(this.selectedCell.dataset.col);
                    this.placeDog(row, col, this.selectedDog);

                    // AUTO-CLEAR: Clear selections after placing
                    this.selectedDog = null;
                    document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                    this.selectedCell = null;
                }
            });

            // Drag start - ONLY on desktop
            if (!this.isMobile) {
                item.addEventListener('dragstart', (e) => {
                    const dogItem = e.currentTarget;
                    if (dogItem.classList.contains('completed')) {
                        e.preventDefault();
                        return;
                    }
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('dogNum', dogItem.dataset.num);

                    // Create custom drag image showing only the dog photo
                    const img = dogItem.querySelector('img');
                    if (img) {
                        const dragImage = img.cloneNode(true);
                        dragImage.style.width = '60px';
                        dragImage.style.height = '60px';
                        dragImage.style.borderRadius = '4px';
                        dragImage.style.position = 'absolute';
                        dragImage.style.top = '-1000px';

                        // Match the cell background color from the theme
                        const cellBg = getComputedStyle(document.documentElement).getPropertyValue('--cell-bg').trim();
                        dragImage.style.background = cellBg;
                        dragImage.style.padding = '2px';

                        document.body.appendChild(dragImage);

                        e.dataTransfer.setDragImage(dragImage, 30, 30);

                        // Remove the temporary image after drag starts
                        setTimeout(() => dragImage.remove(), 0);
                    }
                });
            }
        });

        // Dog panel drop zone - for dragging dogs back to remove them (desktop only)
        if (!this.isMobile) {
            const dogPanel = document.querySelector('.dog-panel');
            dogPanel.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            dogPanel.addEventListener('drop', (e) => {
                e.preventDefault();
                const removeFromBoard = e.dataTransfer.getData('removeFromBoard');
                if (removeFromBoard) {
                    const data = JSON.parse(removeFromBoard);
                    this.removeDog(data.row, data.col);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                if (this.selectedCell) {
                    this.placeNumber(parseInt(e.key));
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                if (this.selectedCell) {
                    this.placeNumber(0);
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });
    }

    showHowToPlay() {
        const modal = document.getElementById('how-to-play-modal');
        if (modal) {
            // Update modal content with current language
            const t = this.translations[this.currentLanguage];

            const title = modal.querySelector('.modal-title');
            if (title) title.textContent = t.howToPlayTitle;

            const subtitle = modal.querySelector('.modal-subtitle');
            if (subtitle) subtitle.textContent = t.howToPlaySubtitle;

            const instructions = modal.querySelectorAll('.modal-instructions li');
            if (instructions.length >= 5) {
                instructions[0].textContent = t.howToPlayStep1;
                instructions[1].textContent = t.howToPlayStep2;
                instructions[2].textContent = t.howToPlayStep3;
                instructions[3].textContent = t.howToPlayStep4;
                instructions[4].textContent = t.howToPlayStep5;
            }

            const haveFun = modal.querySelector('.modal-body p:last-of-type strong');
            if (haveFun) haveFun.textContent = t.howToPlayHaveFun;

            modal.classList.add('show');
            this.initDemo();
        }
    }

    closeHowToPlay() {
        const modal = document.getElementById('how-to-play-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    initDemo() {
        // Create a simple 3x3 demo grid
        this.demoBoard = [
            [1, 0, 0],
            [0, 2, 0],
            [0, 0, 3]
        ];

        this.renderDemo();
    }

    renderDemo() {
        const demoGrid = document.getElementById('demo-grid');
        if (!demoGrid) return;

        demoGrid.innerHTML = '';

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = document.createElement('div');
                cell.className = 'demo-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.demoBoard[row][col] !== 0) {
                    const img = document.createElement('img');
                    img.src = this.breedImages[this.demoBoard[row][col] - 1];
                    img.alt = this.breeds[this.demoBoard[row][col] - 1];
                    img.className = 'demo-cell-img';
                    cell.appendChild(img);
                }

                demoGrid.appendChild(cell);
            }
        }
    }

    showCorrectMove() {
        // Place Leka (dog #1) in position [0,1] - this is correct
        this.demoBoard[0][1] = 1;
        this.renderDemo();

        // Highlight the cell as correct
        const cells = document.querySelectorAll('.demo-cell');
        const targetCell = cells[1]; // row 0, col 1
        targetCell.classList.add('demo-correct');

        // Update explanation
        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '✓ Correct! This dog can be placed here because it doesn\'t repeat in the same row, column, or 3×3 box.';
            explanation.className = 'demo-explanation correct';
        }

        // Remove highlight after 2 seconds
        setTimeout(() => {
            targetCell.classList.remove('demo-correct');
        }, 2000);
    }

    showWrongMove() {
        // Try to place Leka (dog #1) in position [1,0] - this is wrong (same column as [0,0])
        const row = 1;
        const col = 0;

        this.demoBoard[row][col] = 1;
        this.renderDemo();

        // Highlight the cell as wrong
        const cells = document.querySelectorAll('.demo-cell');
        const targetCell = cells[row * 3 + col];
        targetCell.classList.add('demo-wrong');

        // Update explanation
        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '✗ Wrong! This dog already exists in the same column. Each dog can only appear once per row, column, and 3×3 box.';
            explanation.className = 'demo-explanation wrong';
        }

        // Remove the wrong placement after 2 seconds
        setTimeout(() => {
            targetCell.classList.remove('demo-wrong');
            this.demoBoard[row][col] = 0;
            this.renderDemo();
        }, 2000);
    }

    resetDemo() {
        this.demoBoard = [
            [1, 0, 0],
            [0, 2, 0],
            [0, 0, 3]
        ];
        this.renderDemo();

        const explanation = document.getElementById('demo-explanation');
        if (explanation) {
            explanation.textContent = '';
            explanation.className = 'demo-explanation';
        }
    }

    toggleNotesMode() {
        this.notesMode = !this.notesMode;

        // Update all notes button states (desktop + mobile)
        document.querySelectorAll('.notes-btn').forEach(btn => {
            if (this.notesMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // When turning on notes mode: if a dog is already selected, keep it selected for notes
        // When turning off notes mode: clear the selected dog
        if (!this.notesMode) {
            this.selectedDog = null;
            document.querySelectorAll('.dog-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
        // If notes mode is ON and a dog is selected, the user can now place notes with that dog

        // Turn off erase mode when entering notes mode
        if (this.notesMode && this.eraseMode) {
            this.eraseMode = false;
            document.querySelectorAll('.erase-notes-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    }

    eraseAllNotes() {
        // Toggle erase mode
        this.eraseMode = !this.eraseMode;

        // Update all erase button states (desktop + mobile)
        document.querySelectorAll('.erase-notes-btn').forEach(btn => {
            if (this.eraseMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Turn off notes mode when entering erase mode
        if (this.eraseMode && this.notesMode) {
            this.notesMode = false;
            document.querySelectorAll('.notes-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    }

    useHint() {
        // Two-stage hint system:
        // Stage 1: Highlight the best cell and show possible dogs with visual reasoning
        // Stage 2: If tapped again, fill that cell with the correct dog

        // Check if hints are available
        if (this.hintsRemaining <= 0 && !this.hintCell) {
            this.showMessage('No hints remaining!', 'info');
            return;
        }

        // Check if we already have a highlighted hint cell
        if (this.hintCell) {
            // Stage 2: Fill the highlighted cell
            const { row, col, answer } = this.hintCell;

            // Verify the cell is still empty (wasn't filled by user)
            if (this.board[row][col] === 0) {
                // Increment hints used counter (affects score)
                this.hintsUsed++;

                // Place the correct answer in the cell
                this.board[row][col] = answer;

                // Clear any notes in this cell
                this.notes[row][col] = [];

                // Clear notes for this number in related cells
                this.clearNotesForPlacedDog(row, col, answer);

                // Clear all hint highlights
                this.clearAllHintHighlights();

                // Remove the highlight and add reveal animation
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('hint-reveal');
                    setTimeout(() => {
                        cell.classList.remove('hint-reveal');
                    }, 1500);
                }

                // Update the board display
                this.renderBoard();
                this.updateCompletedDogs();
                this.saveGame();

                // Clear the hint cell
                this.hintCell = null;

                // Check for win
                if (this.isBoardComplete() && this.isBoardFullyValid()) {
                    this.endGame(true);
                }
            } else {
                // Cell was already filled, clear hint and find a new one
                this.clearAllHintHighlights();
                this.hintCell = null;
                this.useHint(); // Recursively find a new hint
            }
            return;
        }

        // Stage 1: Find the easiest cell to fill (cell with fewest possibilities)
        let bestCell = null;
        let minPossibilities = 10;
        let bestPossibleDogs = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // Skip cells that are already filled
                if (this.board[row][col] !== 0) continue;

                // Find which numbers are possible for this cell
                let possibleDogs = [];

                for (let num = 1; num <= 9; num++) {
                    if (this.isValid(this.board, row, col, num)) {
                        possibleDogs.push(num);
                    }
                }

                // Find the cell with the fewest possibilities (easiest to solve)
                if (possibleDogs.length > 0 && possibleDogs.length < minPossibilities) {
                    minPossibilities = possibleDogs.length;
                    bestCell = { row, col, answer: this.solution[row][col] };
                    bestPossibleDogs = possibleDogs;

                    // If we find a cell with only 1 possibility, that's the easiest
                    if (possibleDogs.length === 1) break;
                }
            }
            // Early exit if we found a cell with 1 possibility
            if (minPossibilities === 1) break;
        }

        if (bestCell) {
            // Decrement remaining hints immediately and update display
            this.hintsRemaining--;
            this.updateHintCounter();

            // Store the hint cell for stage 2
            this.hintCell = bestCell;
            this.hintCell.possibleDogs = bestPossibleDogs;

            // Show visual hint with reasoning
            this.showHintWithReasoning(bestCell.row, bestCell.col, bestPossibleDogs);
        } else {
            // No empty cells or no valid moves
            this.showMessage('No hints available!', 'info');
        }
    }

    showHintWithReasoning(hintRow, hintCol, possibleDogs) {
        // Highlight the hint cell
        const hintCellEl = document.querySelector(`.cell[data-row="${hintRow}"][data-col="${hintCol}"]`);
        if (hintCellEl) {
            hintCellEl.classList.add('hint-highlight');
        }

        // Highlight the possible dogs in the dog panel
        document.querySelectorAll('.dog-item').forEach(item => {
            const dogNum = parseInt(item.dataset.num);
            if (possibleDogs.includes(dogNum)) {
                item.classList.add('hint-possible-dog');
            }
        });
    }

    clearAllHintHighlights() {
        // Remove all hint-related highlights
        document.querySelectorAll('.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));
        document.querySelectorAll('.hint-reason-row').forEach(el => el.classList.remove('hint-reason-row'));
        document.querySelectorAll('.hint-reason-col').forEach(el => el.classList.remove('hint-reason-col'));
        document.querySelectorAll('.hint-reason-box').forEach(el => el.classList.remove('hint-reason-box'));
        document.querySelectorAll('.hint-possible-dog').forEach(el => el.classList.remove('hint-possible-dog'));
    }

    clearHintHighlight() {
        // Alias for backwards compatibility
        this.clearAllHintHighlights();
    }

    updateHintCounter() {
        // Update hint counter display on all hint buttons
        document.querySelectorAll('.hint-btn').forEach(btn => {
            let counter = btn.querySelector('.hint-counter');
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'hint-counter';
                btn.appendChild(counter);
            }
            counter.textContent = this.hintsRemaining;

            // Add disabled styling if no hints remaining
            if (this.hintsRemaining <= 0) {
                btn.classList.add('hints-exhausted');
            } else {
                btn.classList.remove('hints-exhausted');
            }
        });
    }

    togglePause(isPaused) {
        this.isPaused = isPaused;

        const pauseLabel = document.querySelector('.pause-label');
        const t = this.translations[this.currentLanguage];

        if (this.isPaused) {
            // Pause the timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }

            // Update label to show "Resume"
            if (pauseLabel) pauseLabel.textContent = t.resume;

            // Show sleeping dogs
            this.showSleepingDogs();
        } else {
            // Resume the timer
            this.startTimer();

            // Update label to show "Pause"
            if (pauseLabel) pauseLabel.textContent = t.pause;

            // Restore the board
            this.renderBoard();
        }
    }

    showSleepingDogs() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell sleep-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if ((Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0) {
                    cell.classList.add('alt-block');
                }

                // Use sleeping dog image based on row (one dog per row)
                const img = document.createElement('img');
                img.src = this.sleepImages[row];
                img.alt = 'Sleeping dog';
                img.className = 'cell-img';
                cell.appendChild(img);

                boardElement.appendChild(cell);
            }
        }
    }

    generateSolvedBoard() {
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillBoard(this.solution);
        return this.solution;
    }

    fillBoard(board) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const shuffled = this.shuffle([...numbers]);

                    for (let num of shuffled) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;

                            if (this.fillBoard(board)) {
                                return true;
                            }

                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        // Check row - skip the target cell
        for (let x = 0; x < 9; x++) {
            if (x !== col && board[row][x] === num) {
                return false;
            }
        }

        // Check column - skip the target cell
        for (let x = 0; x < 9; x++) {
            if (x !== row && board[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box - skip the target cell
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Detect conflict type and return conflicting cells for visual hints
    detectConflict(board, row, col, num) {
        // Priority: row → column → box

        // Check row conflict
        const rowConflicts = [];
        for (let x = 0; x < 9; x++) {
            if (x !== col && board[row][x] === num) {
                rowConflicts.push({row: row, col: x});
            }
        }
        if (rowConflicts.length > 0) {
            return {type: 'row', conflicts: rowConflicts, index: row};
        }

        // Check column conflict
        const colConflicts = [];
        for (let x = 0; x < 9; x++) {
            if (x !== row && board[x][col] === num) {
                colConflicts.push({row: x, col: col});
            }
        }
        if (colConflicts.length > 0) {
            return {type: 'column', conflicts: colConflicts, index: col};
        }

        // Check 3x3 box conflict
        const boxConflicts = [];
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === num) {
                    boxConflicts.push({row: currentRow, col: currentCol});
                }
            }
        }
        if (boxConflicts.length > 0) {
            return {type: 'box', conflicts: boxConflicts, startRow: startRow, startCol: startCol};
        }

        return null; // No conflict
    }

    // Find ALL conflicts (row, column, AND box) - for highlighting all at once
    detectAllConflicts(board, row, col, num) {
        const allConflicts = [];

        // Check row conflict
        for (let x = 0; x < 9; x++) {
            if (x !== col && board[row][x] === num) {
                allConflicts.push({row: row, col: x});
            }
        }

        // Check column conflict
        for (let x = 0; x < 9; x++) {
            if (x !== row && board[x][col] === num) {
                // Avoid duplicates
                const isDuplicate = allConflicts.some(c => c.row === x && c.col === col);
                if (!isDuplicate) {
                    allConflicts.push({row: x, col: col});
                }
            }
        }

        // Check 3x3 box conflict
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === num) {
                    // Avoid duplicates
                    const isDuplicate = allConflicts.some(c => c.row === currentRow && c.col === currentCol);
                    if (!isDuplicate) {
                        allConflicts.push({row: currentRow, col: currentCol});
                    }
                }
            }
        }

        return allConflicts.length > 0 ? allConflicts : null;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generatePuzzle() {
        this.generateSolvedBoard();
        this.board = this.solution.map(row => [...row]);

        const cellsToRemove = {
            'easy': 35,
            'medium': 45,
            'hard': 50
        };

        const toRemove = cellsToRemove[this.difficulty];
        const cells = [];

        // Create list of all cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                cells.push({row, col});
            }
        }

        this.shuffle(cells);

        let removed = 0;
        let attempts = 0;
        const maxAttempts = 200;

        for (let cell of cells) {
            if (removed >= toRemove || attempts >= maxAttempts) break;
            attempts++;

            const {row, col} = cell;
            const backup = this.board[row][col];
            this.board[row][col] = 0;

            // Check if puzzle still has unique solution
            const boardCopy = this.board.map(r => [...r]);
            const solutionCount = this.countSolutions(boardCopy, 2);

            if (solutionCount === 1) {
                removed++;
            } else {
                this.board[row][col] = backup;
            }
        }

        // If we couldn't remove enough cells, try again
        if (removed < toRemove * 0.8) {
            this.generatePuzzle();
            return;
        }

        // Validate: Check if any dog number is fully completed (all 9 placed)
        if (this.hasCompleteDogType()) {
            this.generatePuzzle();
            return;
        }

        // Validate: Check if any 3x3 section is fully filled
        if (this.hasFullyFilled3x3Section()) {
            this.generatePuzzle();
            return;
        }
    }

    hasCompleteDogType() {
        // Count how many of each dog number (1-9) are placed
        for (let num = 1; num <= 9; num++) {
            let count = 0;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.board[row][col] === num) {
                        count++;
                    }
                }
            }
            // If all 9 instances of a dog are placed, reject this puzzle
            if (count === 9) {
                return true;
            }
        }
        return false;
    }

    hasFullyFilled3x3Section() {
        // Check each of the 9 3x3 sections
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const startRow = boxRow * 3;
                const startCol = boxCol * 3;
                let filledCount = 0;

                // Count filled cells in this 3x3 section
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (this.board[startRow + i][startCol + j] !== 0) {
                            filledCount++;
                        }
                    }
                }

                // If all 9 cells in this section are filled, reject this puzzle
                if (filledCount === 9) {
                    return true;
                }
            }
        }
        return false;
    }

    countSolutions(board, limit = 2) {
        let count = 0;

        const findEmpty = () => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        return {row, col};
                    }
                }
            }
            return null;
        };

        const solve = () => {
            if (count >= limit) return;

            const empty = findEmpty();
            if (!empty) {
                count++;
                return;
            }

            const {row, col} = empty;

            for (let num = 1; num <= 9; num++) {
                if (this.isValid(board, row, col, num)) {
                    board[row][col] = num;
                    solve();
                    board[row][col] = 0;

                    if (count >= limit) return;
                }
            }
        };

        solve();
        return count;
    }

    selectDogsForGame() {
        // Select 9 dogs for this game
        const selectedIndices = [];

        // If a favorite dog is selected, include it first
        if (this.favoriteDog !== null) {
            selectedIndices.push(this.favoriteDog);
        }

        // Randomly select remaining dogs to reach 9 total
        const availableIndices = [];
        for (let i = 0; i < this.allBreeds.length; i++) {
            if (this.favoriteDog === null || i !== this.favoriteDog) {
                availableIndices.push(i);
            }
        }

        // Shuffle available indices
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }

        // Take the first 8 (or 9 if no favorite) from shuffled array
        const needed = 9 - selectedIndices.length;
        selectedIndices.push(...availableIndices.slice(0, needed));

        // Map to breeds, images, and sleep images
        this.breeds = selectedIndices.map(i => this.allBreeds[i]);
        this.breedImages = selectedIndices.map(i => this.allBreedImages[i]);
        this.sleepImages = selectedIndices.map(i => this.allSleepImages[i]);
    }

    renderDogPanel() {
        const dogItems = document.querySelectorAll('.dog-item');

        for (let i = 0; i < 9; i++) {
            const dogItem = dogItems[i];
            if (!dogItem) continue;

            // Update data-num attribute (1-indexed for game logic)
            dogItem.dataset.num = i + 1;

            // Update dog name
            const nameSpan = dogItem.querySelector('.dog-name');
            if (nameSpan) {
                nameSpan.textContent = this.breeds[i];
            }

            // Update dog image
            const img = dogItem.querySelector('img');
            if (img) {
                img.src = this.breedImages[i];
                img.alt = this.breeds[i];
            }
        }
    }

    generateNewGame() {
        this.mistakes = 0;
        this.hintsUsed = 0;
        this.hintsRemaining = 3;
        this.timer = 0;
        this.selectedCell = null;
        this.selectedDog = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.gameJustStarted = true;
        this.isPaused = false;
        this.gameWon = false;
        this.hintCell = null;
        this.clearHintHighlight();
        this.updateHintCounter();

        // Initialize notes array (9x9 grid of empty arrays)
        this.notes = [];
        for (let i = 0; i < 9; i++) {
            this.notes[i] = [];
            for (let j = 0; j < 9; j++) {
                this.notes[i][j] = [];
            }
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Update difficulty display
        this.updateDifficultyDisplay();

        // Reset pause toggle
        const pauseToggle = document.getElementById('pause-game');
        const pauseLabel = document.querySelector('.pause-label');
        if (pauseToggle) pauseToggle.checked = false;
        if (pauseLabel) pauseLabel.textContent = this.translations[this.currentLanguage].pause;

        // Re-enable undo and redo buttons - all instances
        document.querySelectorAll('.undo-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        document.querySelectorAll('.redo-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });

        // Select 9 dogs for this game (including favorite if set)
        this.selectDogsForGame();
        this.renderDogPanel();

        // Track favorite dog at game start for restart logic
        this.favoriteDogAtGameStart = this.favoriteDog;

        this.generatePuzzle();
        this.initialBoard = this.board.map(row => [...row]);
        this.renderBoard();
        this.updateMistakes();
        this.startTimer();
        this.showMessage('');
        this.updateCompletedDogs();
    }

    restartGame() {
        // Check if favorite dog changed since game started
        if (this.favoriteDog !== this.favoriteDogAtGameStart) {
            // Favorite changed - start a completely new game with the new favorite
            this.generateNewGame();
            return;
        }

        // Favorite didn't change - just reset the current puzzle
        this.renderDogPanel();

        this.mistakes = 0;
        this.hintsUsed = 0;
        this.hintsRemaining = 3;
        this.timer = 0;
        this.selectedCell = null;
        this.selectedDog = null;
        this.completedDogs = [];
        this.moveHistory = [];
        this.gameJustStarted = true;
        this.isPaused = false;
        this.gameWon = false;
        this.hintCell = null;
        this.clearHintHighlight();
        this.updateHintCounter();

        // Clear all notes
        this.notes = [];
        for (let i = 0; i < 9; i++) {
            this.notes[i] = [];
            for (let j = 0; j < 9; j++) {
                this.notes[i][j] = [];
            }
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Reset pause toggle
        const pauseToggle = document.getElementById('pause-game');
        const pauseLabel = document.querySelector('.pause-label');
        if (pauseToggle) pauseToggle.checked = false;
        if (pauseLabel) pauseLabel.textContent = this.translations[this.currentLanguage].pause;

        this.board = this.initialBoard.map(row => [...row]);
        this.renderBoard();
        this.updateMistakes();
        this.startTimer();
        this.showMessage('');
        this.updateCompletedDogs();
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        // Pop the move from history
        const lastMove = this.moveHistory.pop();

        // Save to redo history before undoing
        this.redoHistory.push({
            row: lastMove.row,
            col: lastMove.col,
            previousValue: this.board[lastMove.row][lastMove.col],
            newValue: lastMove.previousValue
        });

        // Undo the move (restore previous value)
        this.board[lastMove.row][lastMove.col] = lastMove.previousValue;

        this.renderBoard();
        this.updateCompletedDogs(false); // Don't show achievements when undoing

        // Note: Mistake counter remains unchanged - mistakes are permanent
    }

    redo() {
        if (this.redoHistory.length === 0) return;

        const redoMove = this.redoHistory.pop();

        // Add back to move history
        this.moveHistory.push({
            row: redoMove.row,
            col: redoMove.col,
            previousValue: redoMove.newValue  // The value before redo (after undo)
        });

        // Apply the redo move - restore the value before undo
        this.board[redoMove.row][redoMove.col] = redoMove.previousValue;

        this.renderBoard();
        this.updateCompletedDogs(false); // Don't show achievements when redoing
    }

    renderBoard() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if ((Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0) {
                    cell.classList.add('alt-block');
                }

                const isGiven = this.initialBoard[row][col] !== 0;

                if (this.board[row][col] !== 0) {
                    const img = document.createElement('img');
                    img.src = this.breedImages[this.board[row][col] - 1];
                    img.alt = this.breeds[this.board[row][col] - 1];
                    img.className = 'cell-img';
                    cell.appendChild(img);

                    if (isGiven) {
                        cell.classList.add('given');
                    } else {
                        // Check if the placement matches the solution
                        const isCorrectAnswer = this.solution[row][col] === this.board[row][col];
                        if (!isCorrectAnswer) {
                            cell.classList.add('error');
                        } else {
                            // Mark as correctly placed (locked)
                            cell.classList.add('locked');
                        }
                    }
                } else {
                    cell.innerHTML = '';

                    // Display notes if cell is empty and has notes
                    if (this.notes && this.notes[row] && this.notes[row][col] && this.notes[row][col].length > 0) {
                        const notesContainer = document.createElement('div');
                        notesContainer.className = 'cell-notes';

                        this.notes[row][col].forEach(noteNum => {
                            const noteImg = document.createElement('img');
                            noteImg.src = this.breedImages[noteNum - 1];
                            noteImg.className = 'note-img';
                            noteImg.alt = '';
                            notesContainer.appendChild(noteImg);
                        });

                        cell.appendChild(notesContainer);
                    }
                }

                if (!isGiven) {
                    // Check if this cell has the correct answer
                    const cellRow = parseInt(row);
                    const cellCol = parseInt(col);
                    const isCorrectlyPlaced = this.board[cellRow][cellCol] !== 0 &&
                                             this.solution[cellRow][cellCol] === this.board[cellRow][cellCol];

                    // Only allow interactions if the dog is not correctly placed
                    if (!isCorrectlyPlaced) {
                        cell.addEventListener('click', () => {
                            if (this.isMobile) {
                                // Mobile: Click to select or remove
                                this.handleMobileCellClick(cell);
                            } else {
                                // Desktop: Select for drag-and-drop
                                this.selectCell(cell);
                            }
                        });

                        // Desktop only: Double-click to remove
                        if (!this.isMobile) {
                            cell.addEventListener('dblclick', () => {
                                const row = parseInt(cell.dataset.row);
                                const col = parseInt(cell.dataset.col);
                                if (this.board[row][col] !== 0) {
                                    this.removeDog(row, col);
                                }
                            });
                        }
                    }

                    // Drag and drop handlers for placing dogs - DESKTOP ONLY
                    if (!this.isMobile && !isCorrectlyPlaced) {
                        cell.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            cell.classList.add('drag-over');
                        });

                        cell.addEventListener('dragleave', () => {
                            cell.classList.remove('drag-over');
                        });

                        cell.addEventListener('drop', (e) => {
                            e.preventDefault();
                            cell.classList.remove('drag-over');

                            // Check if dragging from dog panel
                            const dogNum = e.dataTransfer.getData('dogNum');
                            if (dogNum && dogNum !== '') {
                                const row = parseInt(cell.dataset.row);
                                const col = parseInt(cell.dataset.col);
                                this.placeDog(row, col, parseInt(dogNum));
                                return;
                            }

                            // Check if dragging from another cell
                            const fromCellData = e.dataTransfer.getData('fromCell');
                            if (fromCellData) {
                                const fromCell = JSON.parse(fromCellData);
                                const fromRow = fromCell.row;
                                const fromCol = fromCell.col;
                                const dogNumber = this.board[fromRow][fromCol];

                                if (dogNumber !== 0) {
                                    const targetRow = parseInt(cell.dataset.row);
                                    const targetCol = parseInt(cell.dataset.col);

                                    // Remove from source cell
                                    this.board[fromRow][fromCol] = 0;

                                    // Place in target cell
                                    this.placeDog(targetRow, targetCol, dogNumber);
                                }
                            }
                        });
                    }

                    // Make placed dogs draggable to other cells or back to panel - DESKTOP ONLY
                    if (!this.isMobile && this.board[row][col] !== 0) {
                        const isCorrectAnswer = this.solution[row][col] === this.board[row][col];

                        // Only make draggable if it's NOT the correct answer
                        if (!isCorrectAnswer) {
                            cell.setAttribute('draggable', 'true');

                            cell.addEventListener('dragstart', (e) => {
                                const cellRow = parseInt(e.currentTarget.dataset.row);
                                const cellCol = parseInt(e.currentTarget.dataset.col);

                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('fromCell', JSON.stringify({ row: cellRow, col: cellCol }));

                                // Also set removeFromBoard data for dragging back to panel
                                e.dataTransfer.setData('removeFromBoard', JSON.stringify({ row: cellRow, col: cellCol }));

                                // Create custom drag image
                                const img = e.currentTarget.querySelector('img');
                                if (img) {
                                    const dragImage = img.cloneNode(true);
                                    dragImage.style.width = '60px';
                                    dragImage.style.height = '60px';
                                    dragImage.style.borderRadius = '4px';
                                    dragImage.style.position = 'absolute';
                                    dragImage.style.top = '-1000px';

                                    const cellBg = getComputedStyle(document.documentElement).getPropertyValue('--cell-bg').trim();
                                    dragImage.style.background = cellBg;
                                    dragImage.style.padding = '2px';

                                    document.body.appendChild(dragImage);
                                    e.dataTransfer.setDragImage(dragImage, 30, 30);

                                    setTimeout(() => dragImage.remove(), 0);
                                }
                            });
                        } else {
                            // If it's correct, make it non-draggable and add a visual indicator
                            cell.setAttribute('draggable', 'false');
                            cell.style.cursor = 'default';
                        }
                    }
                }

                boardElement.appendChild(cell);
            }
        }
    }

    selectCell(cell) {
        // Don't allow selection of given cells
        if (cell.classList.contains('given')) {
            return;
        }

        // Get cell position and current value
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentValue = this.board[row][col];

        // Handle erase mode - erase notes when clicking cells
        if (this.eraseMode) {
            this.placeDog(row, col, 0); // Call placeDog which handles erase mode
            return;
        }

        // If cell has an error dog, remove it immediately (matching mobile behavior)
        if (currentValue !== 0 && this.solution[row][col] !== currentValue) {
            this.removeDog(row, col);
            return;
        }

        // Don't allow selection of correctly placed cells
        const isCorrectlyPlaced = currentValue !== 0 &&
                                 this.solution[row][col] === currentValue;

        if (isCorrectlyPlaced) {
            return;
        }

        // If clicking on already selected cell, deselect it
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            this.selectedCell = null;
            return;
        }

        // If a dog is selected, place it immediately
        // This works for: mobile, notes mode, desktop click dog→click cell
        if (this.selectedDog !== null) {
            this.placeDog(row, col, this.selectedDog);
            // placeDog already clears selections, don't select the cell
            return;
        }

        // No dog selected: just select the cell
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        this.selectedCell = cell;
    }

    handleMobileCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentValue = this.board[row][col];

        // Handle erase mode - erase notes when clicking cells
        if (this.eraseMode) {
            this.placeDog(row, col, 0); // Call placeDog which handles erase mode
            return;
        }

        // If cell has an error dog, remove it IMMEDIATELY (user preference)
        if (currentValue !== 0 && this.solution[row][col] !== currentValue) {
            this.removeDog(row, col);
            return;
        }

        // If cell is empty, select it
        if (currentValue === 0) {
            this.selectCell(cell);
            return;
        }

        // If cell has correct dog, do nothing (protected)
    }

    placeDog(row, col, num) {
        const previousValue = this.board[row][col];

        // Clear any hint highlight when user interacts with the board
        if (this.hintCell) {
            this.clearHintHighlight();
            this.hintCell = null;
        }

        // Handle erase mode - erase notes one by one (FIFO - first in, first out)
        if (this.eraseMode) {
            if (this.notes[row][col].length > 0) {
                // Remove the first note (index 0)
                this.notes[row][col].shift();

                // Automatically disable erase mode after erasing one note
                this.eraseMode = false;
                document.querySelectorAll('.erase-notes-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
            this.renderBoard();
            return; // Exit early, don't place the dog
        }

        // Handle notes mode
        if (this.notesMode) {
            if (num === 0) {
                // Clicking cell without dog selected: remove last note (LIFO)
                if (this.notes[row][col].length > 0) {
                    this.notes[row][col].pop(); // Remove the last note
                }
            } else {
                // Check if this dog already exists in same row, column, or 3x3 box
                const conflict = this.findNoteConflict(row, col, num);

                if (conflict) {
                    // Dog already exists - show visual hint and don't add note
                    this.renderBoard();
                    this.showNoteConflictHint(conflict);
                    return;
                }

                // Clicking with dog selected: toggle that specific note
                const noteIndex = this.notes[row][col].indexOf(num);

                if (noteIndex > -1) {
                    // Remove note if it exists
                    this.notes[row][col].splice(noteIndex, 1);
                } else if (this.notes[row][col].length < 3) {
                    // Add note if less than 3 notes
                    this.notes[row][col].push(num);
                }
            }

            this.renderBoard();
            return; // Exit early, don't place the dog
        }

        // Mark that the game is no longer in its initial state
        this.gameJustStarted = false;

        // Clear redo history when a new move is made
        this.redoHistory = [];

        // Add to history
        this.moveHistory.push({row, col, previousValue});

        if (num === 0) {
            this.board[row][col] = 0;
        } else {
            this.board[row][col] = num;

            // Clear notes when placing a real dog
            this.notes[row][col] = [];

            // Check if the placement matches the solution (correct answer)
            const isCorrectAnswer = this.solution[row][col] === num;

            if (!isCorrectAnswer) {
                // Check if previous value was also incorrect
                const previousWasIncorrect = previousValue !== 0 &&
                                            this.solution[row][col] !== previousValue;

                // Only increment mistakes if:
                // 1. Cell was empty (new mistake), OR
                // 2. Cell had correct value (replacing correct with incorrect)
                if (previousValue === 0 || !previousWasIncorrect) {
                    this.mistakes++;
                    this.updateMistakes();
                }

                this.errorSound();

                // Show error animation immediately
                this.renderBoard();
                this.showErrorShake(row, col);

                // Show conflict hint in Easy mode (visual teaching aid)
                this.showConflictHint(row, col, num);

                this.updateCompletedDogs();

                // Clear dog and cell selections after placing (even on error)
                this.selectedDog = null;
                document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
                document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                this.selectedCell = null;

                return; // Exit early to avoid re-rendering
            } else {
                // Correct answer
                this.correctSound();
                this.showStars(row, col);

                // Clear notes of this dog number from same row, column, and 3x3 box
                this.clearNotesForPlacedDog(row, col, num);
            }
        }

        this.renderBoard();
        this.updateCompletedDogs();

        // Show success glow after rendering (so it's not removed by renderBoard)
        // Only show if the placement was correct
        if (this.solution[row][col] === num) {
            this.showSuccessGlow(row, col);
        }

        // Clear dog and cell selections after placing
        this.selectedDog = null;
        document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        this.selectedCell = null;

        if (this.isBoardComplete() && this.isBoardFullyValid()) {
            this.endGame(true);
        }
    }

    removeDog(row, col) {
        // Only remove if cell is not a given (initial) cell
        if (this.initialBoard[row][col] === 0 && this.board[row][col] !== 0) {
            const previousValue = this.board[row][col];

            // Add to history
            this.moveHistory.push({row, col, previousValue});

            // Clear the cell
            this.board[row][col] = 0;

            this.renderBoard();
            this.updateCompletedDogs();

            // Clear dog and cell selections after removing
            this.selectedDog = null;
            document.querySelectorAll('.dog-item').forEach(d => d.classList.remove('selected'));
            document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
            this.selectedCell = null;
        }
    }

    showStars(row, col) {
        const cells = document.querySelectorAll('.cell');
        const cellIndex = row * 9 + col;
        const cell = cells[cellIndex];

        if (!cell) return;

        // Create 5 stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = '⭐';

            // Random direction
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = 20 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            star.style.setProperty('--tx', `${tx}px`);
            star.style.setProperty('--ty', `${ty}px`);
            star.style.left = '50%';
            star.style.top = '50%';
            star.style.transform = 'translate(-50%, -50%)';

            cell.appendChild(star);

            // Remove after animation
            setTimeout(() => star.remove(), 1000);
        }

        // Add correct pulse animation to cell
        cell.classList.add('correct');
        setTimeout(() => cell.classList.remove('correct'), 500);
    }

    showErrorShake(row, col) {
        const cells = document.querySelectorAll('.cell');
        const cellIndex = row * 9 + col;
        const cell = cells[cellIndex];

        if (!cell) return;

        // Add error class for red background and shake animation
        cell.classList.add('error');

        // Add a temporary shake class for animation only
        cell.classList.add('error-shake');

        // Remove only the shake animation after it completes, keep the red background
        setTimeout(() => {
            cell.classList.remove('error-shake');
        }, 300);
    }

    showSuccessGlow(row, col) {
        const cells = document.querySelectorAll('.cell');
        const cellIndex = row * 9 + col;
        const cell = cells[cellIndex];

        if (!cell) return;

        // Add success glow animation
        cell.classList.add('success-glow');

        // Remove the animation class after it completes
        setTimeout(() => {
            cell.classList.remove('success-glow');
        }, 600);
    }

    // Clear notes of the placed dog number from same row, column, and 3x3 box
    clearNotesForPlacedDog(placedRow, placedCol, dogNumber) {
        // Clear from same row
        for (let col = 0; col < 9; col++) {
            if (col !== placedCol) {
                const noteIndex = this.notes[placedRow][col].indexOf(dogNumber);
                if (noteIndex > -1) {
                    this.notes[placedRow][col].splice(noteIndex, 1);
                }
            }
        }

        // Clear from same column
        for (let row = 0; row < 9; row++) {
            if (row !== placedRow) {
                const noteIndex = this.notes[row][placedCol].indexOf(dogNumber);
                if (noteIndex > -1) {
                    this.notes[row][placedCol].splice(noteIndex, 1);
                }
            }
        }

        // Clear from same 3x3 box
        const boxStartRow = Math.floor(placedRow / 3) * 3;
        const boxStartCol = Math.floor(placedCol / 3) * 3;

        for (let row = boxStartRow; row < boxStartRow + 3; row++) {
            for (let col = boxStartCol; col < boxStartCol + 3; col++) {
                if (row !== placedRow || col !== placedCol) {
                    const noteIndex = this.notes[row][col].indexOf(dogNumber);
                    if (noteIndex > -1) {
                        this.notes[row][col].splice(noteIndex, 1);
                    }
                }
            }
        }
    }

    // Show conflict hint - highlights ALL conflicting dogs with flashy red animation
    showConflictHint(row, col, num) {
        // Detect ALL conflicts (row, column, and box)
        const allConflicts = this.detectAllConflicts(this.board, row, col, num);
        if (!allConflicts) return;

        const cells = document.querySelectorAll('.cell');

        // Apply flashy red animation to all conflicting cells
        allConflicts.forEach(conflict => {
            const conflictCellIndex = conflict.row * 9 + conflict.col;
            const conflictCell = cells[conflictCellIndex];

            if (conflictCell) {
                conflictCell.classList.add('note-conflict-pulse');
            }
        });

        // Remove animations after 1.5 seconds
        setTimeout(() => {
            allConflicts.forEach(conflict => {
                const conflictCellIndex = conflict.row * 9 + conflict.col;
                const conflictCell = cells[conflictCellIndex];

                if (conflictCell) {
                    conflictCell.classList.remove('note-conflict-pulse');
                }
            });
        }, 1500);
    }

    // Find if a dog already exists in the same row, column, or 3x3 box (for notes validation)
    findNoteConflict(targetRow, targetCol, num) {
        const conflicts = [];

        // Check row
        for (let col = 0; col < 9; col++) {
            if (this.board[targetRow][col] === num) {
                conflicts.push({ row: targetRow, col: col });
            }
        }

        // Check column
        for (let row = 0; row < 9; row++) {
            if (this.board[row][targetCol] === num) {
                // Avoid duplicates (if already found in row check)
                const isDuplicate = conflicts.some(c => c.row === row && c.col === targetCol);
                if (!isDuplicate) {
                    conflicts.push({ row: row, col: targetCol });
                }
            }
        }

        // Check 3x3 box
        const boxStartRow = Math.floor(targetRow / 3) * 3;
        const boxStartCol = Math.floor(targetCol / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const row = boxStartRow + i;
                const col = boxStartCol + j;
                if (this.board[row][col] === num) {
                    // Avoid duplicates
                    const isDuplicate = conflicts.some(c => c.row === row && c.col === col);
                    if (!isDuplicate) {
                        conflicts.push({ row: row, col: col });
                    }
                }
            }
        }

        // Return all conflicts or null if none found
        return conflicts.length > 0 ? conflicts : null;
    }

    // Show visual hint when user tries to add a note for a dog that already exists
    showNoteConflictHint(conflicts) {
        const cells = document.querySelectorAll('.cell');

        // Apply animation to all conflicting cells
        conflicts.forEach(conflict => {
            const conflictCellIndex = conflict.row * 9 + conflict.col;
            const conflictCell = cells[conflictCellIndex];

            if (conflictCell) {
                conflictCell.classList.add('note-conflict-pulse');
            }
        });

        // Remove animations after 1.5 seconds
        setTimeout(() => {
            conflicts.forEach(conflict => {
                const conflictCellIndex = conflict.row * 9 + conflict.col;
                const conflictCell = cells[conflictCellIndex];

                if (conflictCell) {
                    conflictCell.classList.remove('note-conflict-pulse');
                }
            });
        }, 1500);
    }

    placeNumber(num) {
        if (!this.selectedCell || this.selectedCell.classList.contains('given')) {
            return;
        }

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        this.placeDog(row, col, num);
    }

    updateCompletedDogs(showAchievements = true) {
        const completed = [];
        const previouslyCompleted = this.completedDogs || [];

        for (let num = 1; num <= 9; num++) {
            let count = 0;
            let allValid = true;

            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.board[row][col] === num) {
                        count++;
                        // Check if this placement is valid
                        const tempValue = this.board[row][col];
                        this.board[row][col] = 0;
                        if (!this.isValid(this.board, row, col, tempValue)) {
                            allValid = false;
                        }
                        this.board[row][col] = tempValue;
                    }
                }
            }

            // Only mark as completed if all 9 are placed AND all are valid
            if (count === 9 && allValid) {
                completed.push(num);
            }
        }

        document.querySelectorAll('.dog-item').forEach(item => {
            const dogNum = parseInt(item.dataset.num);
            if (completed.includes(dogNum)) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });

        // Only show achievement if the game has started (user has made at least one move) and showAchievements is true
        if (!this.gameJustStarted && showAchievements) {
            const newlyCompleted = completed.filter(num => !previouslyCompleted.includes(num));
            if (newlyCompleted.length > 0) {
                newlyCompleted.forEach(num => {
                    const dogName = this.breeds[num - 1];
                    const dogIndex = num - 1;
                    // Use plural form
                    const pluralName = dogName.endsWith('s') ? `${dogName}es` : `${dogName}s`;
                    this.showAchievement(`All ${pluralName} are placed!`, dogIndex);
                });
            }
        }

        this.completedDogs = completed;
    }

    showAchievement(message, dogIndex = -1) {
        if (!this.animationEnabled) return; // Check if animations are enabled

        const overlay = document.getElementById('achievement-overlay');
        const text = overlay.querySelector('.achievement-text');
        const iconElement = overlay.querySelector('.achievement-icon');

        text.textContent = message;

        // Use the passed dogIndex directly instead of parsing from message
        const dogImage = dogIndex >= 0 && dogIndex < this.breedImages.length
            ? this.breedImages[dogIndex]
            : this.breedImages[0];

        // Replace the emoji with the dog's image
        const dogName = dogIndex >= 0 && dogIndex < this.breeds.length ? this.breeds[dogIndex] : 'Dog';
        iconElement.innerHTML = `<img src="${dogImage}" alt="${dogName}" style="width: 150px; height: 150px; object-fit: contain; border-radius: 10px;">`;

        // Pause the timer during animation for fair gameplay
        const wasTimerRunning = this.timerInterval !== null;
        if (wasTimerRunning) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        overlay.classList.add('show');

        setTimeout(() => {
            overlay.classList.remove('show');
            // Reset icon to emoji after hiding
            iconElement.innerHTML = '🎉';

            // Resume the timer if it was running, game is not paused, and game is not won
            // Don't call startTimer() as it resets display - just restart the interval
            if (wasTimerRunning && !this.isPaused && !this.gameWon) {
                this.timerInterval = setInterval(() => {
                    this.timer++;
                    const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
                    const seconds = (this.timer % 60).toString().padStart(2, '0');
                    document.querySelector('.time-display').textContent = `${minutes}:${seconds}`;
                }, 1000);
            }
        }, 3000);
    }

    isBoardComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    isBoardFullyValid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = this.board[row][col];
                if (num === 0) continue;

                this.board[row][col] = 0;
                if (!this.isValid(this.board, row, col, num)) {
                    this.board[row][col] = num;
                    return false;
                }
                this.board[row][col] = num;
            }
        }
        return true;
    }

    updateMistakes() {
        // Update both desktop and mobile mistake counters
        document.querySelectorAll('.mistakes-count').forEach(el => {
            el.textContent = this.mistakes;
        });
    }

    startTimer() {
        document.querySelector('.time-display').textContent = '00:00';

        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const seconds = (this.timer % 60).toString().padStart(2, '0');
            document.querySelector('.time-display').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    endGame(won) {
        // Stop the timer completely
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        if (won) {
            // Mark game as won to prevent any timer restarts
            this.gameWon = true;

            // Disable undo and redo buttons - all instances
            document.querySelectorAll('.undo-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
            document.querySelectorAll('.redo-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });

            // Determine performance rating based on mistakes
            let performance;
            let performanceIcon;

            if (this.mistakes === 0) {
                performance = 'Perfect';
                performanceIcon = '🐶';
            } else if (this.mistakes <= 2) {
                performance = 'Good';
                performanceIcon = '🐾';
            } else {
                performance = 'Needs Practice';
                performanceIcon = '😴';
            }

            // Check if timer is enabled (checkbox is checked)
            const showTimerCheckbox = document.getElementById('show-timer');
            const timerVisible = showTimerCheckbox && showTimerCheckbox.checked;

            let message = `${performanceIcon} ${performance}! `;

            if (timerVisible) {
                const minutes = Math.floor(this.timer / 60);
                const seconds = this.timer % 60;
                message += `You solved it in ${minutes}m ${seconds}s`;
            } else {
                message += 'You solved it';
            }

            message += ` with ${this.mistakes} mistake${this.mistakes !== 1 ? 's' : ''}`;
            if (this.hintsUsed > 0) {
                message += ` and ${this.hintsUsed} hint${this.hintsUsed !== 1 ? 's' : ''}`;
            }
            message += '.';

            this.showMessage(message, 'success');
            this.showFinalCelebration();

            // Show win modal with stats
            this.showWinModal();
        }
    }

    showFinalCelebration() {
        // Start bouncing dogs animation (like Solitaire)
        this.createBouncingDogs();

        // Play initial victory bark
        this.playVictoryBark();

        // Show overlay after a short delay
        setTimeout(() => {
            const overlay = document.getElementById('achievement-overlay');
            const text = overlay.querySelector('.achievement-text');
            const confettiContainer = overlay.querySelector('.confetti-container');

            text.textContent = '🎉 You Won! 🎉';
            overlay.classList.add('show');

            // More frequent confetti and fireworks with sounds
            this.celebrationInterval = setInterval(() => {
                // More confetti
                for (let i = 0; i < 2; i++) {
                    this.createDogConfetti(confettiContainer);
                }
                this.createFirework(confettiContainer);
                this.playFireworkSound();
            }, 400);

            // Happy barking sounds periodically
            this.barkInterval = setInterval(() => {
                this.playHappyBark();
            }, 1500);

            // Click anywhere to stop
            const stopCelebration = (e) => {
                e.stopPropagation();
                clearInterval(this.celebrationInterval);
                clearInterval(this.barkInterval);
                if (this.bouncingInterval) {
                    clearInterval(this.bouncingInterval);
                }
                overlay.classList.remove('show');
                confettiContainer.innerHTML = '';
                // Remove bouncing dogs
                document.querySelectorAll('.bouncing-dog').forEach(dog => dog.remove());
                overlay.removeEventListener('click', stopCelebration);
                document.removeEventListener('click', stopCelebration);
            };

            // Listen on both overlay and document
            overlay.addEventListener('click', stopCelebration);
            setTimeout(() => {
                document.addEventListener('click', stopCelebration, { once: true });
            }, 100);
        }, 500);
    }

    createBouncingDogs() {
        const container = document.body;
        const dogImages = [...this.breedImages];

        // Create bouncing dogs continuously
        this.bouncingInterval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const dog = document.createElement('div');
                    dog.className = 'bouncing-dog';

                    const img = document.createElement('img');
                    img.src = dogImages[Math.floor(Math.random() * dogImages.length)];
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.borderRadius = '50%';

                    dog.appendChild(img);

                    // Random starting position at top
                    const startX = Math.random() * (window.innerWidth - 60);
                    dog.style.left = startX + 'px';

                    // Random horizontal velocity
                    const velocityX = (Math.random() - 0.5) * 4;
                    dog.style.setProperty('--vx', velocityX);

                    // Random rotation
                    const rotation = Math.random() * 360;
                    dog.style.setProperty('--rotation', rotation + 'deg');

                    container.appendChild(dog);

                    // Remove after animation
                    setTimeout(() => dog.remove(), 4000);
                }, i * 200);
            }
        }, 600);
    }

    playFireworkSound() {
        if (!this.soundEnabled) return; // Check if sound is enabled
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create sparkly firework sound with multiple tones
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';
                    const startFreq = 1200 + Math.random() * 400;
                    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);

                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.4);
                }, i * 50);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    playHappyBark() {
        if (!this.soundEnabled) return; // Check if sound is enabled
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a happy bark sound (two quick barks)
            for (let bark = 0; bark < 2; bark++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Bark sound characteristics
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                }, bark * 150);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    playVictoryBark() {
        if (!this.soundEnabled) return; // Check if sound is enabled
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Excited victory barks (3 quick barks)
            for (let bark = 0; bark < 3; bark++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sawtooth';
                    const startFreq = 180 + bark * 20;
                    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(90, audioContext.currentTime + 0.12);

                    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                }, bark * 120);
            }
        } catch (e) {
            // Silently fail if audio context not available
        }
    }

    createDogConfetti(container) {
        // Create 5-8 dog confetti pieces for more celebration!
        const count = 5 + Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random dog image
            const randomDog = Math.floor(Math.random() * this.breedImages.length);
            confetti.style.backgroundImage = `url('${this.breedImages[randomDog]}')`;

            // Random horizontal position
            confetti.style.left = Math.random() * 100 + '%';

            // Random size - bigger for more impact
            const size = 35 + Math.random() * 50;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';

            // Random animation duration
            const duration = 3 + Math.random() * 2;
            confetti.style.animationDuration = duration + 's';

            // Random delay
            confetti.style.animationDelay = Math.random() * 0.3 + 's';

            container.appendChild(confetti);

            // Remove after animation
            setTimeout(() => confetti.remove(), (duration + 0.5) * 1000);
        }
    }

    createFirework(container) {
        const firework = document.createElement('div');
        firework.className = 'firework';

        // Random position
        firework.style.left = (20 + Math.random() * 60) + '%';
        firework.style.top = (20 + Math.random() * 60) + '%';

        // Create particles
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            const angle = (360 / particleCount) * i;
            particle.style.setProperty('--angle', angle + 'deg');

            // Random colors
            const colors = ['#9f7aea', '#764ba2', '#f56565', '#48bb78', '#4299e1', '#ed8936'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            firework.appendChild(particle);
        }

        container.appendChild(firework);

        // Remove after animation
        setTimeout(() => firework.remove(), 1500);
    }

    showMessage(text, type = '', duration = 0) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = 'message';

        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }

        if (type) {
            messageEl.classList.add(type);
        }

        if (text) {
            messageEl.classList.add('show');

            // Auto-hide after duration if specified (in milliseconds)
            if (duration > 0) {
                this.messageTimeout = setTimeout(() => {
                    this.showMessage('');
                }, duration);
            }
        } else {
            messageEl.classList.remove('show');
            // Ensure message is completely hidden with no visual artifacts
            messageEl.style.display = 'none';
            setTimeout(() => {
                messageEl.style.display = '';
            }, 50);
        }
    }

    showWinModal() {
        const modal = document.getElementById('win-modal');
        const t = this.translations[this.currentLanguage];

        // Update modal title
        const title = modal.querySelector('.modal-title');
        if (title) title.textContent = `🎉 ${t.congratulations} 🎉`;

        // Update stats text
        const statsText = modal.querySelector('.win-stats');
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeStr = `${minutes}m ${seconds}s`;

        const difficultyText = t[this.difficulty] || this.difficulty;
        let statsMessage = `You completed the ${difficultyText} puzzle in ${timeStr} with ${this.mistakes} mistake${this.mistakes !== 1 ? 's' : ''}`;
        if (this.hintsUsed > 0) {
            statsMessage += ` and ${this.hintsUsed} hint${this.hintsUsed !== 1 ? 's' : ''}`;
        }
        statsMessage += '!';
        statsText.textContent = statsMessage;

        // Update form labels
        const nameLabel = modal.querySelector('label[for="player-name"]');
        if (nameLabel) nameLabel.textContent = t.enterName;

        const nameInput = modal.querySelector('#player-name');
        if (nameInput) nameInput.placeholder = t.playerNamePlaceholder;

        const submitBtn = modal.querySelector('.submit-score-btn');
        if (submitBtn) submitBtn.textContent = t.submitScore;

        const skipBtn = modal.querySelector('.skip-submit-btn');
        if (skipBtn) skipBtn.textContent = t.skip;

        modal.classList.add('show');
    }

    async submitScore(playerName) {
        const score = {
            name: playerName || 'Anonymous',
            difficulty: this.difficulty,
            time: this.timer,
            mistakes: this.mistakes,
            hints: this.hintsUsed,
            timestamp: Date.now()
        };

        // Show loading message
        this.showMessage('Submitting score...', 'info');

        try {
            // Submit to global leaderboard (Google Sheets backend)
            const response = await fetch('https://script.google.com/macros/s/AKfycbykqOIZW3C_2WS0ehEbiQpkCkdpEFsQe8PqQbIiFvAzOv9vS57BNfJW69jLWU_fORm7/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(score)
            });

            // Also save to localStorage as backup
            const localLeaderboard = this.getLocalLeaderboard();
            localLeaderboard.push(score);
            localStorage.setItem('sudoku-leaderboard', JSON.stringify(localLeaderboard));

            // Close win modal
            document.getElementById('win-modal').classList.remove('show');

            // Show success message for 5 seconds
            this.showMessage('Score submitted successfully!', 'success', 5000);

            // Refresh leaderboard to show new score
            setTimeout(() => this.showLeaderboard(this.difficulty), 500);
        } catch (error) {
            console.error('Error submitting score:', error);

            // Fallback to localStorage only
            const localLeaderboard = this.getLocalLeaderboard();
            localLeaderboard.push(score);
            localStorage.setItem('sudoku-leaderboard', JSON.stringify(localLeaderboard));

            document.getElementById('win-modal').classList.remove('show');
            this.showMessage('Score saved locally!', 'success', 5000);
        } finally {
            // Reset submit button state
            this.isSubmitting = false;
            const submitBtn = document.querySelector('.submit-score-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('submitting');
            }
        }
    }

    getLocalLeaderboard() {
        const stored = localStorage.getItem('sudoku-leaderboard');
        return stored ? JSON.parse(stored) : [];
    }

    cleanOldScores(scores) {
        // Remove scores older than 7 days (604800000 milliseconds)
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return scores.filter(score => {
            // If score doesn't have a timestamp, keep it (legacy scores)
            if (!score.timestamp) return true;
            // Keep scores from the last 7 days
            return score.timestamp >= oneWeekAgo;
        });
    }

    async getLeaderboard() {
        try {
            // Fetch from global leaderboard
            const response = await fetch('https://script.google.com/macros/s/AKfycbykqOIZW3C_2WS0ehEbiQpkCkdpEFsQe8PqQbIiFvAzOv9vS57BNfJW69jLWU_fORm7/exec?action=getScores');

            if (response.ok) {
                const data = await response.json();
                const scores = data.scores || [];
                // Clean old scores before returning
                return this.cleanOldScores(scores);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }

        // Fallback to localStorage
        const localScores = this.getLocalLeaderboard();
        // Clean old scores from localStorage
        const cleanedScores = this.cleanOldScores(localScores);

        // Update localStorage with cleaned scores
        if (cleanedScores.length !== localScores.length) {
            localStorage.setItem('sudoku-leaderboard', JSON.stringify(cleanedScores));
        }

        return cleanedScores;
    }

    // Calculate score: Lower is better
    // Formula: time (seconds) + (mistakes * 30 seconds penalty) + (hints * 30 seconds penalty)
    // This means each mistake or hint costs you 30 seconds on your total score
    calculateScore(time, mistakes, hints = 0) {
        return time + (mistakes * 30) + (hints * 30);
    }

    async showLeaderboard(difficulty = 'easy') {
        const modal = document.getElementById('leaderboard-modal');
        const listElement = document.getElementById('leaderboard-list');
        const t = this.translations[this.currentLanguage];

        // Update modal title
        const title = modal.querySelector('.modal-title');
        if (title) title.textContent = `🏆 ${t.leaderboard} 🏆`;

        // Update difficulty tab buttons
        const tabButtons = modal.querySelectorAll('.tab-btn');
        if (tabButtons.length >= 3) {
            tabButtons[0].textContent = t.easy;
            tabButtons[1].textContent = t.medium;
            tabButtons[2].textContent = t.hard;

            // Set active tab based on difficulty parameter
            tabButtons.forEach(btn => btn.classList.remove('active'));
            const difficultyIndex = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;
            tabButtons[difficultyIndex].classList.add('active');
        }

        // Show loading state
        listElement.innerHTML = `<p class="no-scores">${t.loadingScores}</p>`;
        modal.classList.add('show');

        const allScores = await this.getLeaderboard();
        const filteredScores = allScores.filter(score => score.difficulty === difficulty);

        // Calculate total score for each entry
        filteredScores.forEach(score => {
            score.totalScore = this.calculateScore(score.time, score.mistakes, score.hints || 0);
        });

        // Sort by total score (lower is better)
        filteredScores.sort((a, b) => a.totalScore - b.totalScore);

        // Take top 10
        const topScores = filteredScores.slice(0, 10);

        if (topScores.length === 0) {
            listElement.innerHTML = `<p class="no-scores">${t.noScores}</p>`;
        } else {
            listElement.innerHTML = topScores.map((score, index) => {
                const minutes = Math.floor(score.time / 60);
                const seconds = score.time % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                const rank = index + 1;

                const hintsDisplay = score.hints ? `<span class="score-hints">${score.hints} <span class="hint-icon">💡</span></span>` : '';
                return `
                    <div class="leaderboard-item ${rank <= 3 ? 'top-' + rank : ''}">
                        <span class="rank">${rank}</span>
                        <span class="player-name">${score.name}</span>
                        <span class="score-time">${timeStr}</span>
                        <span class="score-mistakes">${score.mistakes} <span class="mistake-icon">❌</span></span>
                        ${hintsDisplay}
                    </div>
                `;
            }).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
