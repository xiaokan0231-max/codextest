      /* ============ 1. Matrix Rain Background ============ */
      const canvas = document.getElementById('matrixCanvas');
      const ctx = canvas.getContext('2d');

      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;

      // Matrix characters (mix of half-width Japanese and binary/hex digits)
      const matrixChars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ10ABCDEF";
      const fontSize = 16;
      const columns = Math.floor(width / fontSize) + 1;
      const ypos = Array(columns).fill(0).map(() => Math.random() * -height);

      function drawMatrix() {
        ctx.fillStyle = 'rgba(6, 9, 19, 0.1)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#10b981'; // Green text
        ctx.font = fontSize + 'px monospace';

        ypos.forEach((y, ind) => {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = ind * fontSize;
          ctx.fillText(char, x, y);

          if (y > height + Math.random() * 500) {
            ypos[ind] = -fontSize;
          } else {
            ypos[ind] = y + fontSize;
          }
        });
      }
      setInterval(drawMatrix, 40);

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });

      /* ============ 2. Cybersecurity Dictionary Data ============ */
      const glossaryDict = {
        // --- Cybersecurity Terminology ---
        "脆弱性": { kanji: "脆弱性", kana: "ぜいじゃくせい", meaning: "Vulnerability / Security flaw in a software system", zh: "安全漏洞 / 脆弱性" },
        "ペネトレーションテスト": { kanji: "ペネトレーションテスト", kana: "ぺねとれーしょんてすと", meaning: "Penetration Testing / Simulated cyberattack to evaluate defense", zh: "渗透测试" },
        "ランサムウェア": { kanji: "ランサムウェア", kana: "らんさむうぇあ", meaning: "Ransomware / Malware that encrypts files and demands ransom", zh: "勒索软件" },
        "SOC": { kanji: "SOC", kana: "そっく (Security Operations Center)", meaning: "Security Operations Center monitoring network traffic 24/7", zh: "安全运行中心 / 安全运营中心" },
        "CSIRT": { kanji: "CSIRT", kana: "しーさーと (Computer Security Incident Response Team)", meaning: "Incident response team dedicated to resolving security events", zh: "安全事件响应组" },
        "CISO": { kanji: "CISO", kana: "しーあいえすおー", meaning: "Chief Information Security Officer driving security policies", zh: "首席信息安全官" },
        "バグバウンティ": { kanji: "バグバウンティ", kana: "ばぐばうんてぃ", meaning: "Bug Bounty / Rewards researchers for reporting vulnerabilities", zh: "漏洞赏金计划" },
        "リバースエンジニアリング": { kanji: "リバースエンジニアリング", kana: "りばーすえんじにありんぐ", meaning: "Reverse Engineering / Decompiling software to study internal workings", zh: "逆向工程" },

        // --- Katakana Loanwords & Origins ---
        "サイバーセキュリティ": { kanji: "サイバーセキュリティ", kana: "さいばーせきゅりてぃ", meaning: "Cybersecurity / Protection of systems, networks, and data", zh: "网络安全" },
        "ハッカー": { kanji: "ハッカー", kana: "はっかー", meaning: "Hacker / IT expert who uses bugs or exploits to access systems", zh: "黑客 / 骇客" },
        "ホワイトハットハッカー": { kanji: "ホワイトハットハッカー", kana: "ほわいとはっとはっかー", meaning: "White Hat Hacker / Ethical security expert helping organizations defend", zh: "白帽黑客" },
        "ホワイトハット": { kanji: "ホワイトハット", kana: "ほわいとはっと", meaning: "White Hat / Ethical hackers or cyber defenders", zh: "白帽" },
        "ブラックハットハッカー": { kanji: "ブラックハットハッカー", kana: "ぶらっくはっとはっかー", meaning: "Black Hat Hacker / Malicious hacker violating security for personal gain", zh: "黑帽黑客" },
        "ブラックハット": { kanji: "ブラックハット", kana: "ぶらっくはっと", meaning: "Black Hat / Malicious cyber criminals", zh: "黑帽" },
        "レッドチーム": { kanji: "レッドチーム", kana: "れっどちーむ", meaning: "Red Team / Offensively simulating real cyberattacks to test defenses", zh: "红队 / 进攻方" },
        "ブルーチーム": { kanji: "ブルーチーム", kana: "ぶるーちーむ", meaning: "Blue Team / Defending computer networks and responding to security incidents", zh: "蓝队 / 防守方" },
        "コミュニティ": { kanji: "コミュニティ", kana: "こみゅにてぃ", meaning: "Community / Group of interacting people sharing goals or interests", zh: "社区 / 共同体" },
        "キャリアパス": { kanji: "キャリアパス", kana: "きゃりあぱす", meaning: "Career Path / Progression or development plan in a profession", zh: "职业路径 / 职业生涯规划" },
        "インフラ": { kanji: "インフラ", kana: "いんふら", meaning: "Infrastructure / Underlying physical and software systems", zh: "基础设施 / 基建" },
        "プライバシー": { kanji: "プライバシー", kana: "ぷらいばしー", meaning: "Privacy / Right to keep personal information secure", zh: "隐私" },
        "データ": { kanji: "データ", kana: "でーた", meaning: "Data / Digital information processed by a computer", zh: "数据" },
        "インターネット": { kanji: "インターネット", kana: "いんたーねっと", meaning: "Internet / Global interconnected computer network", zh: "互联网" },
        "プラットフォーム": { kanji: "プラットフォーム", kana: "ぷらっとふぉーむ", meaning: "Platform / Standard software environment or service foundation", zh: "平台" },
        "バグハンティング": { kanji: "バグハンティング", kana: "ばぐはんてぃんぐ", meaning: "Bug Hunting / Looking for software vulnerabilities for rewards", zh: "漏洞寻找 / 找Bug" },
        "ウイルス": { kanji: "ウイルス", kana: "ういるす", meaning: "Virus / Malicious code designed to spread and infect systems", zh: "计算机病毒" },
        "マルウェア": { kanji: "マルウェア", kana: "まるうぇあ", meaning: "Malware / Malicious software designed to compromise computers", zh: "恶意软件" },
        "フィッシング": { kanji: "フィッシング", kana: "ふぃっしんぐ", meaning: "Phishing / Social engineering scams to steal credentials", zh: "网络钓鱼" },
        "シミュレーター": { kanji: "シミュレーター", kana: "しみゅれーたー", meaning: "Simulator / System that models or emulates a real-world scenario", zh: "模拟器" },
        "ツールスキャン": { kanji: "ツールスキャン", kana: "つーるすきゃん", meaning: "Tool Scan / Automated scanning using software tools", zh: "工具扫描" },
        "コンサルティング": { kanji: "コンサルティング", kana: "こんさるてぃんぐ", meaning: "Consulting / Giving expert advisory services to businesses", zh: "咨询服务 / 顾问咨询" },
        "コンサルタント": { kanji: "コンサルタント", kana: "こんさるたんと", meaning: "Consultant / Expert professional providing advice", zh: "顾问 / 咨询师" },
        "フォレンジック": { kanji: "フォレンジック", kana: "ふぉれんじっく", meaning: "Forensics / Digital forensics, recovery and investigation of digital evidence", zh: "数字取证 / 计算机取证" },
        "ログ": { kanji: "ログ", kana: "ろぐ", meaning: "Log / Automatically generated record of system activity", zh: "日志" },
        "インシデント": { kanji: "インシデント", kana: "いんしでんと", meaning: "Incident / An event that disrupts operations or security", zh: "安全事件 / 协同事件" },
        "バイナリ": { kanji: "バイナリ", kana: "ばいなり", meaning: "Binary / Compiled software executable or raw machine data", zh: "二进制 / 二进制文件" },
        "スカウト": { kanji: "スカウト", kana: "すかうと", meaning: "Scout / Act of seeking and recruiting talent", zh: "猎头 / 招募" },
        "ベンダー": { kanji: "ベンダー", kana: "べんだー", meaning: "Vendor / Company supplying technology products or services", zh: "厂商 / 服务商" },
        "マネジメント": { kanji: "マネジメント", kana: "まねじめんと", meaning: "Management / Process of leading and controlling an organization", zh: "管理" },
        "アーキテクト": { kanji: "アーキテクト", kana: "あーきてくと", meaning: "Architect / Senior engineer designing system structures", zh: "架构师" },
        "エヴァンジェリスト": { kanji: "エヴァンジェリスト", kana: "えゔぁんじぇりすと", meaning: "Evangelist / Technology promoter or advocate", zh: "技术传道者 / 布道师" },
        "ビジネス": { kanji: "ビジネス", kana: "びじねす", meaning: "Business / Commercial, industrial, or professional operations", zh: "业务 / 商业" },
        "システム": { kanji: "システム", kana: "しすてむ", meaning: "System / Interconnected software components or machines", zh: "系统" },
        "ソフトウェア": { kanji: "ソフトウェア", kana: "そふとうぇあ", meaning: "Software / Programs running on a computer system", zh: "软件" },
        "ポートスキャン": { kanji: "ポートスキャン", kana: "ぽーとすきゃん", meaning: "Port Scan / Surveying computer ports to find active services", zh: "端口扫描" },
        "デバッグモード": { kanji: "デバッグモード", kana: "でばっぐもーど", meaning: "Debug Mode / Developer troubleshooting mode in an application", zh: "调试模式" },

        // --- Japanese Vocabulary & Phrases ---
        "第一歩": { kanji: "第一歩", kana: "だいいっぽ", meaning: "The first step / Initial action", zh: "第一步" },
        "盾": { kanji: "盾", kana: "たて", meaning: "Shield / Protection", zh: "盾牌" },
        "防衛": { kanji: "防衛", kana: "ぼうえい", meaning: "Defense / Guarding", zh: "防卫" },
        "悪意": { kanji: "悪意", kana: "あくい", meaning: "Malice / Bad intent", zh: "恶意 / 怀有恶意" },
        "先に見つけ": { kanji: "先に見つけ", kana: "さきにみつけ", meaning: "Find beforehand / Find first", zh: "先发现 / 抢先找到" },
        "生計を立てる": { kanji: "生計を立てる", kana: "せいけいをたてる", meaning: "Make a living / Earn a livelihood", zh: "维持生计 / 谋生" },
        "暗躍する": { kanji: "暗躍する", kana: "あんやくする", meaning: "Pulling strings in the dark / Secret maneuvers", zh: "暗中活动 / 幕后活跃" },
        "標的型攻撃": { kanji: "標的型攻撃", kana: "ひょうてきがたこうげき", meaning: "Targeted attack / Spear phishing", zh: "针对性攻击" },
        "模して": { kanji: "模して", kana: "もして", meaning: "Imitating / Modeling after (from 模する)", zh: "模拟 / 模仿" },
        "実戦訓練": { kanji: "実戦訓練", kana: "じっせんくんれん", meaning: "Combat drill / Hands-on training", zh: "实战训练" },
        "絶え間ない": { kanji: "絶え間ない", kana: "たえまない", meaning: "Incessant / Continuous / Unending", zh: "不断的 / 连续不断的" },
        "砦": { kanji: "砦", kana: "とりで", meaning: "Fortress / Stronghold", zh: "要塞 / 堡垒" },
        "腕を競い合います": { kanji: "腕を競い合います", kana: "うでをきそいあいます", meaning: "Compete with skills (from 腕を競い合う)", zh: "切磋武艺 / 竞技比赛" },
        "徹夜": { kanji: "徹夜", kana: "てつや", meaning: "Staying up all night", zh: "熬夜 / 通宵" },
        "一手に引き受ける": { kanji: "一手に引き受ける", kana: "いってにひきうける", meaning: "Take sole responsibility / Undertake all by oneself", zh: "一手承担 / 独揽" },
        "生き抜く": { kanji: "生き抜く", kana: "いきぬく", meaning: "Survive / Live through", zh: "生存下去 / 活下去" },
        "官公庁": { kanji: "官公庁", kana: "かんこうちょう", meaning: "Government offices / Public agencies", zh: "政府机关 / 官公厅" },
        "意思決定": { kanji: "意思決定", kana: "いしけってい", meaning: "Decision making", zh: "决策 / 做出决定" },
        "監査": { kanji: "監査", kana: "かんさ", meaning: "Audit / Inspection", zh: "审计 / 监察" },
        "策定": { kanji: "策定", kana: "さくてい", meaning: "Formulating / Drafting policies", zh: "制定 / 拟定" },
        "脅威": { kanji: "脅威", kana: "きょうい", meaning: "Threat / Menace", zh: "威胁 / 恐吓" },
        "全般": { kanji: "全般", kana: "ぜんぱん", meaning: "Overall / In general", zh: "全体 / 全般" },
        // --- Added Vocabulary & Terminology ---
        "ガイドライン": { kanji: "ガイドライン", kana: "がいどらいん", meaning: "Guideline / Set of rules or principles", zh: "指导方针 / 准则" },
        "ルール": { kanji: "ルール", kana: "るーる", meaning: "Rule / Regulation", zh: "规则 / 规章" },
        "侵入テスト": { kanji: "侵入テスト", kana: "しんにゅうてすと", meaning: "Penetration Test / Intrusion test", zh: "渗透测试 / 侵入测试" },
        "ソーシャルエンジニアリング": { kanji: "ソーシャルエンジニアリング", kana: "そーしゃるえんじにありんぐ", meaning: "Social Engineering / Manipulating people to get sensitive info", zh: "社会工程学" },
        "デジタル": { kanji: "デジタル", kana: "でじたる", meaning: "Digital", zh: "数字化 / 数字" },
        "クリエイティブ": { kanji: "クリエイティブ", kana: "くりえいてぃぶ", meaning: "Creative", zh: "创造性的 / 有创意的" },
        "マニュアル": { kanji: "マニュアル", kana: "まにゅある", meaning: "Manual / Guidebook", zh: "手册 / 指南" },
        "リアルタイム": { kanji: "リアルタイム", kana: "りあるたいむ", meaning: "Real-time", zh: "实时" },
        "MSSP": { kanji: "MSSP", kana: "えむえすえすぴー (Managed Security Service Provider)", meaning: "Managed Security Service Provider outsourced for IT defense", zh: "托管安全服务提供商" },
        "プログラム": { kanji: "プログラム", kana: "ぷろぐらむ", meaning: "Program", zh: "程序" },
        "ハッキング": { kanji: "ハッキング", kana: "はっきんぐ", meaning: "Hacking", zh: "黑客行为 / 攻击" },
        "コーディング": { kanji: "コーディング", kana: "こーでぃんぐ", meaning: "Coding", zh: "编码 / 写代码" },
        "サポート": { kanji: "サポート", kana: "さぽーと", meaning: "Support", zh: "支持 / 协助" },
        "スペシャリスト": { kanji: "スペシャリスト", kana: "すぺしゃりすと", meaning: "Specialist", zh: "专家 / 专员" },
        "メガベンチャー": { kanji: "メガベンチャー", kana: "めがべんちゃー", meaning: "Mega Venture (和製英語) / Large-scale tech startup", zh: "大型创业公司" },
        "グローバル": { kanji: "グローバル", kana: "ぐろーばる", meaning: "Global", zh: "全球性的 / 国际化" },
        "発見": { kanji: "発見", kana: "はっけん", meaning: "Discovery / Detection", zh: "发现" },
        "報告": { kanji: "報告", kana: "ほうこく", meaning: "Report / Notification", zh: "报告 / 汇报" },
        "修復": { kanji: "修復", kana: "しゅうふく", meaning: "Repair / Restoration", zh: "修复 / 修补" },
        "調査": { kanji: "調査", kana: "ちょうさ", meaning: "Investigation / Survey / Research", zh: "调查 / 审查" },
        "パズル": { kanji: "パズル", kana: "ぱずる", meaning: "Puzzle", zh: "拼图 / 谜题" },
        "謎解き": { kanji: "謎解き", kana: "なぞとき", meaning: "Riddle solving / Solving puzzles by reasoning", zh: "解谜 / 解答谜题" },
        "バグ": { kanji: "バグ", kana: "ばぐ", meaning: "Bug / Mistake or defect in software", zh: "程序错误 / Bug" },
        "見つけた": { kanji: "見つけた", kana: "みつけた", meaning: "Found / Discovered", zh: "发现了 / 找到了" },
        "感じます": { kanji: "感じます", kana: "かんじます", meaning: "Feel / Sense / Think emotionally", zh: "感觉 / 觉得" },
        "仕組み": { kanji: "仕組み", kana: "しくみ", meaning: "Mechanism / How something works", zh: "机制 / 原理" },
        "徹底的に": { kanji: "徹底的に", kana: "てっていてきに", meaning: "Thoroughly / Completely", zh: "彻底地 / 全面地" },
        "追求": { kanji: "追求", kana: "ついきゅう", meaning: "Pursuit / Digging deeply into a topic", zh: "追求 / 深究" },
        "利用": { kanji: "利用", kana: "りよう", meaning: "Use / Take advantage of", zh: "利用 / 使用" },
        "有利": { kanji: "有利", kana: "ゆうり", meaning: "Advantageous / Having an advantage", zh: "有利 / 占优势" },
        "進める": { kanji: "進める", kana: "すすめる", meaning: "Proceed / Move forward", zh: "推进 / 进行" },
        "修正": { kanji: "修正", kana: "しゅうせい", meaning: "Correction / Fixing a mistake", zh: "修正 / 修改" },
        "綺麗": { kanji: "綺麗", kana: "きれい", meaning: "Clean / Neat / Beautiful", zh: "漂亮 / 干净整洁" },
        "直したい": { kanji: "直したい", kana: "なおしたい", meaning: "Want to fix / Want to repair", zh: "想修好 / 想改正" },
        "競い合って": { kanji: "競い合って", kana: "きそいあって", meaning: "Competing with each other", zh: "互相竞争 / 切磋" },
        "楽しみたい": { kanji: "楽しみたい", kana: "たのしみたい", meaning: "Want to enjoy / Want to have fun", zh: "想享受 / 想玩得开心" },
        "製品価値": { kanji: "製品価値", kana: "せいひんかち", meaning: "Product value / Value of a product", zh: "产品价值" },
        "影響": { kanji: "影響", kana: "えいきょう", meaning: "Influence / Impact", zh: "影响" },
        "視点": { kanji: "視点", kana: "してん", meaning: "Point of view / Perspective", zh: "视角 / 观点" },
        "関係ない": { kanji: "関係ない", kana: "かんけいない", meaning: "Not related / None of my business", zh: "没关系 / 与我无关" },
        "放置": { kanji: "放置", kana: "ほうち", meaning: "Leaving something as it is / Ignoring it", zh: "放置 / 不管不顾" },
        "弱点": { kanji: "弱点", kana: "じゃくてん", meaning: "Weakness / Weak point / Vulnerability", zh: "弱点 / 缺点" },

        "報奨金": { kanji: "報奨金", kana: "ほうしょうきん", meaning: "Bounty / Reward money", zh: "奖金 / 赏金" },
        "存在": { kanji: "存在", kana: "そんざい", meaning: "Existence / Being", zh: "存在" },
        "窃取": { kanji: "窃取", kana: "せっしゅ", meaning: "Theft / Stealing", zh: "窃取 / 偷盗" },
        "身代金": { kanji: "身代金", kana: "みのしろきん", meaning: "Ransom", zh: "赎金" },
        "要求": { kanji: "要求", kana: "ようきゅう", meaning: "Demand / Request", zh: "要求 / 索要" },
        "情報漏洩": { kanji: "情報漏洩", kana: "じょうほうろうえい", meaning: "Information Leak / Data breach", zh: "信息泄露" },
        "詐欺": { kanji: "詐欺", kana: "さぎ", meaning: "Fraud / Scam / Swindle", zh: "诈骗 / 欺诈" },
        "手法": { kanji: "手法", kana: "しゅほう", meaning: "Method / Technique", zh: "手法 / 方法" },
        "心理": { kanji: "心理", kana: "しんり", meaning: "Psychology / Mental state", zh: "心理" },
        "手口": { kanji: "手口", kana: "てぐち", meaning: "Method / Trick / Modus operandi of a crime", zh: "作案手法 / 招数" },
        "分析": { kanji: "分析", kana: "ぶんせき", meaning: "Analysis", zh: "分析" },
        "追跡": { kanji: "追跡", kana: "ついせき", meaning: "Tracking / Pursuit", zh: "追踪 / 追捕" },
        "近道": { kanji: "近道", kana: "ちかみち", meaning: "Shortcut", zh: "捷径" },
        "機能": { kanji: "機能", kana: "きのう", meaning: "Function / Feature / Operation", zh: "功能 / 职能" },
        "侵入": { kanji: "侵入", kana: "しんにゅう", meaning: "Intrusion / Penetration / Break-in", zh: "侵入 / 渗透" },
        "物理": { kanji: "物理", kana: "ぶつり", meaning: "Physical / Physics", zh: "物理 / 实体" },
        "発想": { kanji: "発想", kana: "はっそう", meaning: "Idea / Conceptualization / Way of thinking", zh: "想法 / 构思" },
        "模索": { kanji: "模索", kana: "もさく", meaning: "Groping / Searching for a solution", zh: "摸索 / 探索" },
        "隙": { kanji: "隙", kana: "すき", meaning: "Gap / Vulnerability / Opening", zh: "空隙 / 漏洞 / 破绽" },
        "検知": { kanji: "検知", kana: "けんち", meaning: "Detection / Sensing", zh: "检测 / 感知" },
        "防御": { kanji: "防御", kana: "ぼうぎょ", meaning: "Defense / Protection", zh: "防御 / 防守" },
        "発生": { kanji: "発生", kana: "はっせい", meaning: "Occurrence / Outbreak", zh: "发生" },
        "対処": { kanji: "対処", kana: "たいしょ", meaning: "Dealing with / Coping with / Response", zh: "应对 / 处置" },
        "監視": { kanji: "監視", kana: "かんし", meaning: "Monitoring / Surveillance", zh: "监视 / 监控" },
        "事案": { kanji: "事案", kana: "じあん", meaning: "Case / Matter / Incident", zh: "案情 / 事项 / 事件" },
        "封じ込め": { kanji: "封じ込め", kana: "ふうじこめ", meaning: "Containment / Isolation of threats", zh: "封锁 / 遏制" },
        "慎重": { kanji: "慎重", kana: "しんちょう", meaning: "Prudence / Discretion / Caution", zh: "慎重 / 谨慎" },
        "観察力": { kanji: "観察力", kana: "かんさつりょく", meaning: "Observation skills", zh: "观察力" },
        "異常": { kanji: "異常", kana: "いじょう", meaning: "Anomaly / Abnormality", zh: "异常" },
        "細部": { kanji: "細部", kana: "さいぶ", meaning: "Details / Fine parts", zh: "细节 / 局部" },
        "遮断": { kanji: "遮断", kana: "しゃだん", meaning: "Blockade / Isolation / Disconnection", zh: "阻断 / 遮断" },
        "最小限": { kanji: "最小限", kana: "さいしょうげん", meaning: "Minimum", zh: "最小限度 / 尽量少" },
        "使命": { kanji: "使命", kana: "しめい", meaning: "Mission / Calling", zh: "使命 / 天职" },
        "競技": { kanji: "競技", kana: "きょうぎ", meaning: "Competition / Contest / Game", zh: "竞技 / 比赛" },
        "暗号解読": { kanji: "暗号解読", kana: "あんごうかいどく", meaning: "Cryptography / Codebreaking", zh: "解密 / 密码破译" },
        "解析": { kanji: "解析", kana: "かいせき", meaning: "Analysis / Parsing", zh: "分析 / 解析" },
        "課題": { kanji: "課題", kana: "かだい", meaning: "Task / Challenge / Assignment", zh: "课题 / 任务 / 挑战" },
        "隠された": { kanji: "隠された", kana: "かくされた", meaning: "Hidden / Concealed (from 隠す)", zh: "隐藏的 / 被隐匿的" },
        "主催": { kanji: "主催", kana: "しゅさい", meaning: "Hosting / Sponsorship", zh: "主办 / 举办" },
        "負けず嫌い": { kanji: "負けず嫌い", kana: "まけずぎらい", meaning: "Hating to lose / Highly competitive", zh: "好胜 / 不服输" },
        "多々": { kanji: "多々", kana: "たた", meaning: "Many / A lot / Frequently", zh: "很多 / 频繁" },
        "開発": { kanji: "開発", kana: "かいはつ", meaning: "Development", zh: "开发" },
        "製品": { kanji: "製品", kana: "せいひん", meaning: "Product", zh: "产品" },
        "派遣": { kanji: "派遣", kana: "はけん", meaning: "Dispatch / Deployment", zh: "派遣 / 派驻" },
        "対策": { kanji: "対策", kana: "たいさく", meaning: "Countermeasure / Action plan", zh: "对策 / 防治措施" },
        "顧客": { kanji: "顧客", kana: "こきゃく", meaning: "Customer / Client", zh: "顾客 / 客户" },
        "説明": { kanji: "説明", kana: "せつめい", meaning: "Explanation / Description", zh: "解释 / 说明" },
        "市場": { kanji: "市場", kana: "しじょう", meaning: "Market", zh: "市场" },
        "成長": { kanji: "成長", kana: "せいちょう", meaning: "Growth / Development", zh: "增长 / 发展" },
        "人材": { kanji: "人材", kana: "じんざい", meaning: "Human resources / Talent", zh: "人才 / 人力资源" },
        "不足": { kanji: "不足", kana: "ふそく", meaning: "Shortage / Lack", zh: "不足 / 匮乏" },
        "多様": { kanji: "多様", kana: "たよう", meaning: "Diverse / Various", zh: "多样 / 多元化" },
        "責任者": { kanji: "責任者", kana: "せきにんしゃ", meaning: "Person in charge / Director / Officer", zh: "负责人 / 主管" },
        "主体的に": { kanji: "主体的に", kana: "しゅたいてきに", meaning: "Proactively / Independently", zh: "主动地 / 自主地" },
        "意欲": { kanji: "意欲", kana: "いよく", meaning: "Motivation / Will / Eagerness", zh: "意愿 / 积极性" },
        "最強": { kanji: "最強", kana: "さいきょう", meaning: "Strongest / Most powerful", zh: "最强" },
        "武器": { kanji: "武器", kana: "ぶき", meaning: "Weapon", zh: "武器" },
        "安全": { kanji: "安全", kana: "あんぜん", meaning: "Safety / Security", zh: "安全" },
        "確保": { kanji: "確保", kana: "かくほ", meaning: "Securing / Guaranteeing", zh: "确保 / 保障" },
        "攻撃": { kanji: "攻撃", kana: "こうげき", meaning: "Attack / Offensive", zh: "攻击 / 攻势" },
        "評価": { kanji: "評価", kana: "ひょうか", meaning: "Evaluation / Assessment / Rating", zh: "评估 / 评价" },
        "価値": { kanji: "価値", kana: "かち", meaning: "Value / Worth", zh: "价值" },
        "重要": { kanji: "重要", kana: "じゅうよう", meaning: "Important / Crucial", zh: "重要 / 关键" },
        "正義": { kanji: "正義", kana: "せいぎ", meaning: "Justice / Righteousness", zh: "正义" },
        "保護": { kanji: "保護", kana: "ほご", meaning: "Protection / Safeguarding", zh: "保护" },
        "知的好奇心": { kanji: "知的好奇心", kana: "ちてきこうきしん", meaning: "Intellectual Curiosity", zh: "求知欲 / 好奇心" },
        "得意": { kanji: "得意", kana: "とくい", meaning: "Strong point / Specialty / Good at", zh: "擅长 / 拿手" },
        "個人情報": { kanji: "個人情報", kana: "こじんじょうほう", meaning: "Personal Information / PII", zh: "个人信息 / 个人隐私" },
        "脅迫": { kanji: "脅迫", kana: "きょうはく", meaning: "Threat / Coercion / Blackmail", zh: "威胁 / 恐吓 / 胁迫" },
};

      function formatGlossaryTerms(text) {
        const terms = Object.keys(glossaryDict).sort((a, b) => b.length - a.length);
        let result = text;
        const replacements = [];

        // 1. Mark terms sequentially with temporary index placeholders to avoid double-wrapping
        terms.forEach((term, index) => {
          const escapedTerm = term.replace(/[-\/\^$*+?.()|[\]{}]/g, '\$&');
          const regex = new RegExp(escapedTerm, 'g');
          if (regex.test(result)) {
            const placeholder = `___GLOSSARY_${index}___`;
            replacements.push({ placeholder, term });
            result = result.replace(regex, placeholder);
          }
        });

        // 2. Substitute placeholders with styled HTML spans
        replacements.forEach(({ placeholder, term }) => {
          const isKatakana = /^[゠-ヿー]+$/.test(term);
          if (isKatakana) {
            const item = glossaryDict[term];
            const origin = item.meaning.includes(" / ") ? item.meaning.split(" / ")[0] : item.meaning;
            result = result.replace(
              new RegExp(placeholder, 'g'),
              `<span class="glossary-term katakana-term" data-term="${term}" data-origin="${origin}" tabindex="0">${term}</span>`
            );
          } else {
            result = result.replace(
              new RegExp(placeholder, 'g'),
              `<span class="glossary-term" data-term="${term}" tabindex="0">${term}</span>`
            );
          }
        });

        return result;
      }

      /* ============ 2.1 Glossary Hover Tooltip & Dynamic Formatting ============ */
      let activeTooltip = null;
      let activeTooltipTerm = null;
      // Track last known pointer position so we can re-show the tooltip when the
      // DOM under a stationary cursor changes (e.g. user clicks a node while
      // hovering a term — the new term needs to take over without requiring a
      // mouse wiggle).
      let lastPointer = { x: -1, y: -1, hasPosition: false };

      // Detached references (term removed from DOM, tooltip detached) are a
      // common source of "stuck" state. Resetting them here keeps state honest.
      function pruneStaleState() {
        if (activeTooltipTerm && !activeTooltipTerm.isConnected) {
          activeTooltipTerm = null;
        }
        if (activeTooltip && !activeTooltip.isConnected) {
          activeTooltip = null;
        }
      }

      function hideTooltip() {
        if (activeTooltip) {
          activeTooltip.classList.remove('active');
          activeTooltip.remove();
        }
        activeTooltip = null;
        activeTooltipTerm = null;
      }

      function getGlossaryTermFromEvent(e) {
        const eventTarget = e.target?.closest?.('.glossary-term');
        if (eventTarget) return eventTarget;

        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          return document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.glossary-term') || null;
        }

        return null;
      }

      function showTooltipForTerm(termEl) {
        if (!termEl || !termEl.isConnected) return;
        const termKey = termEl.dataset.term;
        const item = glossaryDict[termKey];
        if (!item) return;
        pruneStaleState();
        activeTooltipTerm = termEl;

        if (!activeTooltip) {
          activeTooltip = document.createElement('div');
          activeTooltip.className = 'glossary-tooltip';
          document.body.appendChild(activeTooltip);
        }

        if (termEl.classList.contains('katakana-term')) {
          activeTooltip.className = 'glossary-tooltip katakana-tooltip';
        } else {
          activeTooltip.className = 'glossary-tooltip';
        }

        activeTooltip.innerHTML = `
          <div class="glossary-tooltip-kana">【${item.kana}】</div>
          <div class="glossary-tooltip-meaning">${item.meaning}</div>
          <div class="glossary-tooltip-zh">${item.zh}</div>
        `;

        activeTooltip.classList.add('active');

        const rect = termEl.getBoundingClientRect();
        const tooltipWidth = activeTooltip.offsetWidth;
        const tooltipHeight = activeTooltip.offsetHeight;

        let left = rect.left + window.scrollX + (rect.width - tooltipWidth) / 2;
        let top = rect.top + window.scrollY - tooltipHeight - 8;

        if (left < 10) {
          left = 10;
        } else if (left + tooltipWidth > window.innerWidth - 10) {
          left = window.innerWidth - tooltipWidth - 10;
        }
        if (top < window.scrollY + 10) {
          top = rect.bottom + window.scrollY + 8;
        }

        activeTooltip.style.left = `${left}px`;
        activeTooltip.style.top = `${top}px`;
      }

      function showTooltip(e) {
        const termEl = getGlossaryTermFromEvent(e);
        if (!termEl) return;
        showTooltipForTerm(termEl);
      }

      function handleGlossaryPointerMove(e) {
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          lastPointer.x = e.clientX;
          lastPointer.y = e.clientY;
          lastPointer.hasPosition = true;
        }
        pruneStaleState();
        const termEl = getGlossaryTermFromEvent(e);
        if (termEl) {
          if (termEl !== activeTooltipTerm) showTooltipForTerm(termEl);
          return;
        }
        if (activeTooltipTerm) hideTooltip();
      }

      // Called after a DOM update (e.g. setActive) to honour the user's
      // stationary cursor: if it now sits over a glossary term, show its
      // tooltip without waiting for the next pointermove.
      function refreshTooltipUnderCursor() {
        if (!lastPointer.hasPosition) return;
        const el = document.elementFromPoint(lastPointer.x, lastPointer.y);
        const termEl = el?.closest?.('.glossary-term');
        if (termEl) {
          showTooltipForTerm(termEl);
        } else if (activeTooltipTerm) {
          hideTooltip();
        }
      }

      function bindGlossaryTerms(root = document) {
        // Per-term listeners exist only for inputs the document-level
        // delegates miss: keyboard focus (a11y) and click (for touch / explicit
        // intent). All hover, leave, and blur cases are handled by the
        // document-level delegated listeners further below, which understand
        // relatedTarget and avoid the leave→enter flicker that per-term
        // pointerleave/mouseleave used to cause when moving between adjacent
        // terms.
        root.querySelectorAll('.glossary-term').forEach(term => {
          if (term.dataset.tooltipBound === '1') return;
          term.dataset.tooltipBound = '1';
          term.addEventListener('focus', showTooltip);
          term.addEventListener('click', showTooltip);
        });
      }

      // Capture-phase position tracker — fires before any other handler so
      // lastPointer is always up to date when other handlers run. Only mouse
      // movement events are tracked; synthetic .click() and keyboard-driven
      // clicks come through with clientX/Y = 0, which would falsely move
      // lastPointer to the top-left corner.
      function trackPointerPosition(e) {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          // Reject the (0, 0) sentinel that synthetic / keyboard events ship
          // unless the previous position was also near origin (genuine corner
          // hover is rare; the false-positive cost is much higher).
          if (e.clientX === 0 && e.clientY === 0 && lastPointer.hasPosition) return;
          lastPointer.x = e.clientX;
          lastPointer.y = e.clientY;
          lastPointer.hasPosition = true;
        }
      }
      document.addEventListener('pointermove', trackPointerPosition, { capture: true, passive: true });
      document.addEventListener('mousemove', trackPointerPosition, { capture: true, passive: true });

      document.addEventListener('pointerover', showTooltip);
      document.addEventListener('mouseover', showTooltip);
      document.addEventListener('pointermove', handleGlossaryPointerMove, { passive: true });
      document.addEventListener('mousemove', handleGlossaryPointerMove, { passive: true });
      document.addEventListener('focusin', showTooltip);
      // Out / leave handling: use relatedTarget to avoid hiding when the
      // pointer is just moving between two adjacent glossary terms.
      function handleLeave(e) {
        const termEl = e.target.closest?.('.glossary-term');
        if (!termEl) return;
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !relatedTarget.closest?.('.glossary-term')) {
          hideTooltip();
        }
      }
      document.addEventListener('pointerout', handleLeave);
      document.addEventListener('mouseout', handleLeave);
      document.addEventListener('focusout', (e) => {
        if (e.target.closest?.('.glossary-term')) hideTooltip();
      });
      document.addEventListener('scroll', hideTooltip, { passive: true });
      document.addEventListener('click', (e) => {
        if (!e.target.closest?.('.glossary-term')) hideTooltip();
      });

      function formatElementText(el) {
        if (!el) return;
        const skipTags = ['SCRIPT', 'STYLE', 'SVG', 'PATH', 'CANVAS', 'TEXTAREA', 'INPUT', 'BUTTON'];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
          acceptNode: function(node) {
            const parent = node.parentNode;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (parent.closest('.glossary-term')) return NodeFilter.FILTER_REJECT;
            if (parent.closest('.company-logo')) return NodeFilter.FILTER_REJECT;
            if (parent.closest('.news-trigger') || parent.closest('.map-node-button')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          textNodes.push(node);
        }

        for (let i = textNodes.length - 1; i >= 0; i--) {
          const textNode = textNodes[i];
          const parent = textNode.parentNode;
          if (!parent) continue;

          const text = textNode.nodeValue;
          if (!text.trim()) continue;

          const formatted = formatGlossaryTerms(text);
          if (formatted !== text) {
            const temp = document.createElement('div');
            temp.innerHTML = formatted;
            
            const fragment = document.createDocumentFragment();
            while (temp.firstChild) {
              fragment.appendChild(temp.firstChild);
            }
            parent.replaceChild(fragment, textNode);
          }
        }
      }

      /* ============ 3. Nodes Data ============ */
      const nodes = [
        {
          id: 'intro', title: 'サイバーセキュリティ入門', kicker: '01. INTRO',
          risk: '安全の第一歩', icon: '🌐',
          x: 50, y: 15, color: '#10b981',
          summary: 'データ・プライバシー・社会インフラを脅威から守る現代の盾。',
          role: '全体像と基本ルールを学ぶ入口',
          work: 'リスク評価・監査・ガイドライン策定',
          fit: '社会を守ることに価値を感じる人',
          related: ['whitehat', 'blackhat']
        },
        {
          id: 'whitehat', title: 'ホワイトハットハッカー', kicker: '02. WHITE HAT',
          risk: '正義の技術者', icon: '🦸',
          x: 28, y: 38, color: '#38bdf8',
          summary: '高い技術で脆弱性を見つけ、システムを守る正義側のハッカー。',
          role: '攻撃者より先に穴を見つける',
          work: 'バグハンティング・脆弱性研究',
          fit: 'パズル好きで知的好奇心が強い人',
          related: ['intro', 'redteam', 'blueteam', 'ctf']
        },
        {
          id: 'blackhat', title: 'ブラックハットハッカー', kicker: '03. BLACK HAT',
          risk: 'サイバー犯罪者', icon: '💀',
          x: 72, y: 38, color: '#f43f5e',
          summary: '悪意を持って情報窃取・金銭脅迫・破壊活動を行う攻撃者。',
          role: '社会を脅かす敵としての存在',
          work: '標的型攻撃・ランサムウェア・詐欺',
          fit: '彼らの手口を理解することが防衛の鍵',
          related: ['intro', 'ctf']
        },
        {
          id: 'redteam', title: 'レッドチーム', kicker: '04. RED TEAM',
          risk: '安全性の検証役', icon: '⚔️',
          x: 12, y: 62, color: '#ff5c7a',
          summary: '攻撃者を模して組織の防衛体制をテストするチーム。',
          role: '許可を得て侵入テストを実施',
          work: 'ペネトレーション・ソーシャル工学',
          fit: 'マニュアル外の発想ができる人',
          related: ['whitehat', 'blueteam', 'careers']
        },
        {
          id: 'blueteam', title: 'ブルーチーム', kicker: '05. BLUE TEAM',
          risk: '絶え間ない防衛', icon: '🛡️',
          x: 37, y: 62, color: '#3b82f6',
          summary: '攻撃をリアルタイムで検知・防御し、事故に素早く対応。',
          role: 'SOC / CSIRT で防御運用',
          work: 'ログ監視・解析・封じ込め',
          fit: '観察力があり細部に気づける人',
          related: ['whitehat', 'redteam', 'industry', 'careers']
        },
        {
          id: 'ctf', title: 'CTF & コミュニティ', kicker: '06. CTF & SOCIAL',
          risk: '技術競技場', icon: '🏁',
          x: 63, y: 62, color: '#a855f7',
          summary: 'ハッキング競技で世界のハッカーと腕を競い合う場。',
          role: '実戦力を競技で鍛える',
          work: 'リバエン・暗号解読・Web攻撃演習',
          fit: '徹夜でパズルを解くのが好きな人',
          related: ['whitehat', 'blackhat', 'careers']
        },
        {
          id: 'industry', title: 'セキュリティ企業', kicker: '07. INDUSTRY',
          risk: 'ビジネスと防衛', icon: '🏢',
          x: 88, y: 62, color: '#f59e0b',
          summary: '他企業のセキュリティ運用を支える専門ベンダー。',
          role: '製品開発・コンサル・運用代行',
          work: 'プロダクト開発・MSS 提供',
          fit: '専門知識を伝えるのが好きな人',
          related: ['blueteam', 'careers']
        },
        {
          id: 'careers', title: 'キャリアパス', kicker: '08. CAREERS',
          risk: '自分だけの道', icon: '🎯',
          x: 50, y: 85, color: '#ffd700',
          summary: '世界的に人材不足。多様なキャリアの選択肢が広がる。',
          role: '技術職から CISO まで幅広く',
          work: 'アーキテクト・CISO・エヴァンジェリスト',
          fit: '主体的に学び続けられる人',
          related: ['redteam', 'blueteam', 'ctf', 'industry']
        }
      ];

      // Backwards-compat: old code may still reference `kind`, `companies`, `memo`.
      nodes.forEach(n => { n.kind = n.role; n.companies = ''; n.memo = ''; });

      const edges = [
        ['intro', 'whitehat'],
        ['intro', 'blackhat'],
        ['whitehat', 'redteam'],
        ['whitehat', 'blueteam'],
        ['whitehat', 'ctf'],
        ['blackhat', 'ctf'],
        ['redteam', 'blueteam'],
        ['blueteam', 'industry'],
        ['ctf', 'careers'],
        ['industry', 'careers'],
        ['redteam', 'careers'],
        ['blueteam', 'careers']
      ];

      /* ============ 4. Map & Nodes Rendering Logic ============ */
      const shell = document.getElementById('shell');
      const stage = document.getElementById('mapStage');
      const edgeLayer = document.getElementById('edgeLayer');
      const dots = document.getElementById('progressDots');
      const stepLabel = document.getElementById('stepLabel');
      const detailTitle = document.getElementById('detailTitle');
      const detailSummary = document.getElementById('detailSummary');
      const detailKind = document.getElementById('detailKind');
      const detailCompanies = document.getElementById('detailCompanies'); // optional
      const detailWork = document.getElementById('detailWork');
      const detailFit = document.getElementById('detailFit');
      const detailIcon = document.getElementById('detailIcon');
      const detailCard = document.querySelector('.detail-card');
      const talkMemo = document.getElementById('talkMemo');
      const activeModeLabel = document.getElementById('activeModeLabel');

      let activeIndex = 0;

      function nodeById(id) {
        return nodes.find(node => node.id === id);
      }

      function renderEdges() {
        edgeLayer.innerHTML = '';
        edges.forEach(([fromId, toId]) => {
          const from = nodeById(fromId);
          const to = nodeById(toId);
          if (!from || !to) return;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', from.x);
          line.setAttribute('y1', from.y);
          line.setAttribute('x2', to.x);
          line.setAttribute('y2', to.y);
          line.dataset.from = fromId;
          line.dataset.to = toId;
          line.classList.add('edge');
          edgeLayer.appendChild(line);
        });
      }

      function renderNodes() {
        nodes.forEach((node, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'map-node-button';
          button.style.left = `${node.x}%`;
          button.style.top = `${node.y}%`;
          button.style.animationDelay = `${index * 80}ms`;
          button.style.setProperty('--node-color', node.color);
          button.dataset.id = node.id;
          button.innerHTML = `
            <span class="node-icon" aria-hidden="true">${node.icon || ''}</span>
            <span class="node-body">
              <span class="node-kicker">${node.kicker}</span>
              <span class="node-title">${node.title}</span>
              <span class="node-risk">${node.risk}</span>
            </span>
            <span class="node-pulse" aria-hidden="true"></span>
          `;
          button.addEventListener('click', () => setActive(index, true));
          stage.appendChild(button);
        });
      }

      function renderDots() {
        if (!dots) return;
        nodes.forEach((node, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'progress-dot';
          dot.setAttribute('aria-label', `${index + 1}: ${node.title}`);
          dot.addEventListener('click', () => setActive(index, true));
          dots.appendChild(dot);
        });
      }

      function setActive(index, shouldFocus = false) {
        activeIndex = (index + nodes.length) % nodes.length;
        const active = nodes[activeIndex];
        const related = new Set(active.related);

        document.body.style.setProperty('--active', active.color);
        shell.style.setProperty('--active', active.color);
        if (activeModeLabel) {
          activeModeLabel.style.setProperty('--active', active.color);
        }

        document.querySelectorAll('.map-node-button').forEach(button => {
          const id = button.dataset.id;
          button.classList.toggle('active', id === active.id);
          button.classList.toggle('related', related.has(id));
          button.setAttribute('aria-pressed', id === active.id ? 'true' : 'false');
        });

        document.querySelectorAll('.edge').forEach(line => {
          const from = line.dataset.from;
          const to = line.dataset.to;
          const isActive = from === active.id || to === active.id;
          line.classList.toggle('active', isActive);
        });

        document.querySelectorAll('.progress-dot').forEach((dot, dotIndex) => {
          dot.classList.toggle('active', dotIndex === activeIndex);
        });

        stepLabel.textContent = `${activeIndex + 1} / ${nodes.length}`;
        detailTitle.innerHTML = formatGlossaryTerms(active.title);
        if (detailIcon && active.icon) detailIcon.textContent = active.icon;

        // Dynamically apply term glossary formatting
        detailSummary.innerHTML = formatGlossaryTerms(active.summary);
        detailKind.innerHTML = formatGlossaryTerms(active.kind || active.role || '');
        if (detailCompanies) detailCompanies.innerHTML = formatGlossaryTerms(active.companies || '');
        detailWork.innerHTML = formatGlossaryTerms(active.work);
        detailFit.innerHTML = formatGlossaryTerms(active.fit);
        bindGlossaryTerms(detailCard);

        if (talkMemo) {
          talkMemo.innerHTML = formatGlossaryTerms(active.memo || '');
          bindGlossaryTerms(talkMemo);
        }

        // The user often clicks a node while hovering a term — without this
        // the new content under the stationary cursor would show no tooltip
        // until the user moves the mouse, which feels broken. We defer to the
        // next task so the document-level click handler (which calls
        // hideTooltip when the click target isn't a term) has finished
        // bubbling and won't immediately tear down the tooltip we just opened.
        setTimeout(refreshTooltipUnderCursor, 0);



        if (shouldFocus) {
          const activeButton = document.querySelector(`.map-node-button[data-id="${active.id}"]`);
          if (activeButton) activeButton.focus({ preventScroll: true });
        }
      }

      function goNext() {
        setActive(activeIndex + 1, true);
      }

      function goPrev() {
        setActive(activeIndex - 1, true);
      }



      let sideNavKeyboardIndex = null;
      let sideNavKeyboardLockUntil = 0;

      function getCurrentSideNavIndex(navDots) {
        if (sideNavKeyboardIndex !== null && performance.now() < sideNavKeyboardLockUntil) {
          return sideNavKeyboardIndex;
        }

        const activeDot = navDots.find(dot => dot.classList.contains('is-active'));
        if (activeDot) return navDots.indexOf(activeDot);

        const viewportMiddle = window.innerHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        navDots.forEach((dot, index) => {
          const target = document.getElementById(dot.dataset.target);
          if (!target) return;
          const rect = target.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        return closestIndex;
      }

      function goSideNav(direction) {
        const navDots = Array.from(document.querySelectorAll('.side-nav-dot'));
        if (!navDots.length) return;

        const currentIndex = getCurrentSideNavIndex(navDots);
        const nextIndex = Math.max(0, Math.min(navDots.length - 1, currentIndex + direction));
        const target = document.getElementById(navDots[nextIndex].dataset.target);
        sideNavKeyboardIndex = nextIndex;
        sideNavKeyboardLockUntil = performance.now() + 900;
        navDots.forEach((dot, index) => dot.classList.toggle('is-active', index === nextIndex));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      window.addEventListener('keydown', event => {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (document.querySelector('.modal-overlay.active, .infographic-fullscreen.active')) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          goSideNav(1);
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          goSideNav(-1);
        }
        if (event.key === 'ArrowRight' || event.key === ' ') {
          event.preventDefault();
          goNext();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        }
      });



      /* ============ 6. Personality Quiz Logic ============ */
      const quizModal = document.getElementById('quizModal');
      const startQuizBtn = document.getElementById('startQuizBtn');
      const quizCloseBtn = document.getElementById('quizCloseBtn');
      const quizBody = document.getElementById('quizBody');
      const quizQuestionContainer = document.getElementById('quizQuestionContainer');
      const quizQuestionText = document.getElementById('quizQuestionText');
      const quizAnswers = document.getElementById('quizAnswers');
      const quizResultContainer = document.getElementById('quizResultContainer');
      const quizResultTitle = document.getElementById('quizResultTitle');
      const quizResultDesc = document.getElementById('quizResultDesc');
      const quizResultDetail = document.getElementById('quizResultDetail');
      const restartQuizBtn = document.getElementById('restartQuizBtn');

      const quizQuestions = [
        {
          question: "Q1. パズルや謎解き、またはソフトウェアでバグを見つけた時、どう感じますか？",
          answers: [
            { text: "原因を調べて、正しい相手に安全に報告したい", score: { whitehat: 3 } },
            { text: "その弱点を使えば、どこまで入れるのか試したくなる", score: { blackhat: 3 } },
            { text: "面倒なので、自分には関係ないと思って放置する", score: { victimRisk: 3 } }
          ]
        },
        {
          question: "Q2. パソコンやスマートフォンのOSアップデートの通知が来たら？",
          answers: [
            { text: "早めに更新して、何が修正されたのかも軽く確認する", score: { whitehat: 3 } },
            { text: "修正された弱点を見て、攻撃側の考え方を想像する", score: { blackhat: 3 } },
            { text: "今まで被害がないので、今回も無視して大丈夫だと思う", score: { victimRisk: 4 } }
          ]
        },
        {
          question: "Q3. 怪しいメールやリンクを見た時、まずどうしますか？",
          answers: [
            { text: "送信元やURLを確認し、必要なら周りに注意を共有する", score: { whitehat: 3 } },
            { text: "人をだます文章の作り方や心理の動きを分析したくなる", score: { blackhat: 3 } },
            { text: "急いでいる時は、とりあえず押してから考える", score: { victimRisk: 4 } }
          ]
        },
        {
          question: "Q4. ハッカーという言葉を聞いて、一番ワクワクする役割は？",
          answers: [
            { text: "弱点を見つけて、社会や会社を守るホワイトハット", score: { whitehat: 3 } },
            { text: "ルールの外側から、抜け道や裏ルートを探すブラックハット", score: { blackhat: 3 } },
            { text: "難しそうなので、セキュリティは専門家だけに任せたい", score: { victimRisk: 3 } }
          ]
        }
      ];

      const quizResults = {
        whitehat: {
          title: "🛡️ ホワイトハット向き",
          desc: "あなたは弱点を見つけて、正しい方法で守る側に活かせるタイプです。",
          detail: "原因を調べる力、報告する姿勢、相手を守ろうとする考え方があります。脆弱性診断、SOC、CSIRT、バグバウンティなど、合法的に社会を守る仕事と相性がよいです。"
        },
        blackhat: {
          title: "⚠️ ブラックハット気質",
          desc: "あなたは攻撃者の視点を想像する力が強いタイプです。",
          detail: "抜け道を探す発想は強みですが、許可なく試す行為は違法です。その好奇心は、CTF、Red Team、脆弱性診断など、ルールのある安全な場所で使うのが一番かっこいい道です。"
        },
        victimRisk: {
          title: "🚨 一番ハッキングされやすいタイプ",
          desc: "あなたは『自分は大丈夫』と思いやすく、基本対策を後回しにしがちなタイプです。",
          detail: "怪しいリンクを押さない、OSやアプリを更新する、パスワードを使い回さない、二段階認証を使う。この4つを守るだけで、被害にあう可能性をかなり下げられます。"
        }
      };

      let currentQuestionIndex = 0;
      const initialQuizScores = {
        whitehat: 0,
        blackhat: 0,
        victimRisk: 0
      };
      let scores = { ...initialQuizScores };

      function startQuiz() {
        currentQuestionIndex = 0;
        scores = { ...initialQuizScores };
        quizQuestionContainer.style.display = 'block';
        quizResultContainer.style.display = 'none';
        showQuestion();
        quizModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function showQuestion() {
        const q = quizQuestions[currentQuestionIndex];
        quizQuestionText.innerHTML = formatGlossaryTerms(q.question);
        quizAnswers.innerHTML = '';
        
        q.answers.forEach(ans => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-option';
          btn.innerHTML = formatGlossaryTerms(ans.text);
          btn.addEventListener('click', () => selectAnswer(ans.score));
          quizAnswers.appendChild(btn);
        });
        bindGlossaryTerms(quizQuestionContainer);
      }

      function selectAnswer(scoreMap) {
        for (let role in scoreMap) {
          if (!(role in scores)) scores[role] = 0;
          scores[role] += scoreMap[role];
        }
        
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
          showQuestion();
        } else {
          showResult();
        }
      }

      function showResult() {
        let maxScore = -1;
        let topRole = 'careers';
        
        for (let role in scores) {
          if (scores[role] > maxScore) {
            maxScore = scores[role];
            topRole = role;
          }
        }
        
        const result = quizResults[topRole] || quizResults.careers;
        quizResultTitle.innerHTML = formatGlossaryTerms(result.title);
        quizResultDesc.innerHTML = formatGlossaryTerms(result.desc);
        quizResultDetail.innerHTML = formatGlossaryTerms(result.detail);
        bindGlossaryTerms(quizResultContainer);
        
        quizQuestionContainer.style.display = 'none';
        quizResultContainer.style.display = 'block';
      }

      function closeQuiz() {
        quizModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      quizCloseBtn.addEventListener('click', closeQuiz);
      restartQuizBtn.addEventListener('click', startQuiz);
      quizModal.addEventListener('click', (e) => {
        if (e.target === quizModal) closeQuiz();
      });

      /* ============ 7. News Case Modal Logic ============ */
      const newsTrigger = document.getElementById('newsTrigger');
      const newsModal = document.getElementById('newsModal');
      const newsCloseBtn = document.getElementById('newsCloseBtn');
      const aiTrigger = document.getElementById('aiTrigger');
      const aiModal = document.getElementById('aiModal');
      const aiCloseBtn = document.getElementById('aiCloseBtn');

      function openNewsModal() {
        newsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeNewsModal() {
        newsModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      function openAiModal() {
        aiModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeAiModal() {
        aiModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      newsTrigger.addEventListener('click', openNewsModal);
      newsCloseBtn.addEventListener('click', closeNewsModal);
      newsModal.addEventListener('click', (e) => {
        if (e.target === newsModal) closeNewsModal();
      });
      aiTrigger.addEventListener('click', openAiModal);
      aiCloseBtn.addEventListener('click', closeAiModal);
      aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) closeAiModal();
      });

      /* Simulated Terminal Logic removed */

      /* ============ 8. Infographic Fullscreen Logic ============ */
      const infographicFullscreen = document.getElementById('infographicFullscreen');

      function openInfographic() {
        infographicFullscreen.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeInfographic() {
        infographicFullscreen.classList.remove('active');
        document.body.style.overflow = '';
      }

      /* ============ 8.5 Companies & Cert data ============ */
      const companies = [
        {
          region: 'japan', color: '#e11d48',
          tag: '日本', est: 'EST. 1988',
          name: 'Trend Micro',
          url: 'https://www.trendmicro.com/',
          logoClass: 'logo-trend',
          ariaLabel: 'Trend Micro 公式サイトを開く',
          svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="tmGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3b5c"/><stop offset="1" stop-color="#a30326"/></linearGradient></defs><path d="M32 6 L54 16 V34 C54 47 44 55 32 58 C20 55 10 47 10 34 V16 Z" fill="url(#tmGrad)" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/><text x="32" y="40" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="22" font-weight="900" fill="#fff">T</text></svg>`,
          copy: '「ウイルスバスター」で家庭から大企業まで守る、日本発の世界的セキュリティ大手。',
          stats: [
            { count: 500, unit: 'M+', label: '守られている端末' },
            { count: 7000, unit: '+', label: 'グローバル従業員' }
          ],
          chips: ['アンチウイルス', 'クラウド防御', 'XDR']
        },
        {
          region: 'japan', color: '#2563eb',
          tag: '日本', est: 'EST. 1992',
          name: 'NTT Security',
          url: 'https://www.security.ntt/',
          logoClass: 'logo-ntt',
          ariaLabel: 'NTT Security 公式サイトを開く',
          svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="nttGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b8dff"/><stop offset="1" stop-color="#0b3a99"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="url(#nttGrad)" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><text x="32" y="40" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="15" font-weight="900" fill="#fff" letter-spacing="1">NTT</text></svg>`,
          copy: 'NTTグループの世界規模 MSS。日本最大の通信会社が持つ脅威情報で 24/7 監視を提供。',
          stats: [
            { count: 40, unit: '+', label: '対応国／地域' },
            { count: 1500, unit: '+', label: 'セキュリティ専門家' }
          ],
          chips: ['SOC / MSS', '脅威インテリ', 'コンサル']
        },
        {
          region: 'global', color: '#22c55e',
          tag: '世界', est: 'EST. 1975',
          name: 'Microsoft Security',
          url: 'https://www.microsoft.com/security',
          logoClass: 'logo-ms',
          ariaLabel: 'Microsoft Security 公式サイトを開く',
          svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="8" width="22" height="22" fill="#f25022"/><rect x="34" y="8" width="22" height="22" fill="#7fba00"/><rect x="8" y="34" width="22" height="22" fill="#00a4ef"/><rect x="34" y="34" width="22" height="22" fill="#ffb900"/></svg>`,
          copy: 'Windows / Azure / 365 を一体で守る世界最大級のセキュリティ事業。Defender と Entra が柱。',
          stats: [
            { count: 78, unit: 'T+', label: '毎日解析するシグナル' },
            { count: 20, unit: 'B$', label: '年間セキュリティ売上' }
          ],
          chips: ['Defender', 'Sentinel SIEM', 'ゼロトラスト']
        },
        {
          region: 'global', color: '#dc2626',
          tag: '世界', est: 'EST. 2011',
          name: 'CrowdStrike',
          url: 'https://www.crowdstrike.com/',
          logoClass: 'logo-cs',
          ariaLabel: 'CrowdStrike 公式サイトを開く',
          svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="csGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2a2a"/><stop offset="1" stop-color="#7a0000"/></linearGradient></defs><circle cx="32" cy="32" r="26" fill="#0a0a0a" stroke="url(#csGrad)" stroke-width="2"/><path d="M22 22 L42 32 L22 42 L26 32 Z" fill="url(#csGrad)"/><circle cx="32" cy="32" r="3" fill="#fff"/></svg>`,
          copy: 'EDR / XDR の世界リーダー。Falcon プラットフォームで脅威を秒単位で検知・対応。',
          stats: [
            { count: 29000, unit: '+', label: 'グローバル顧客' },
            { count: 1, unit: '分', label: '平均検知時間' }
          ],
          chips: ['Falcon EDR', '脅威ハンティング', 'IR']
        }
      ];

      const certs = [
        { step: '01', color: '#38bdf8', icon: '📘', level: '入門',     title: '言葉に慣れる', items: ['IT パスポート', '情セキマネ'] },
        { step: '02', color: '#10b981', icon: '🔧', level: '基礎技術', title: '土台を作る',   items: ['基本情報技術者', '応用情報技術者'] },
        { step: '03', color: '#f59e0b', icon: '🛡️', level: '専門',     title: '国家試験',     items: ['情報処理安全確保支援士', '登録セキスペ'] },
        { step: '04', color: '#a855f7', icon: '🌐', level: '実務・国際', title: '国際資格',   items: ['CompTIA Security+', 'CISSP'] }
      ];

      function renderCompanies() {
        const grid = document.getElementById('companyGrid');
        if (!grid) return;
        const escapeAttr = (s) => String(s).replace(/"/g, '&quot;');
        grid.innerHTML = companies.map(c => `
          <article class="company-card ${c.region}" style="--company-color:${c.color}">
            <div class="company-pulse" aria-hidden="true"></div>
            <div class="company-topline">
              <a class="company-logo ${c.logoClass}" href="${c.url}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(c.ariaLabel)}">
                ${c.svg}
              </a>
              <div class="company-tagline">
                <span class="company-tag">${c.tag}</span>
                <span class="company-rank">${c.est}</span>
              </div>
            </div>
            <h3 class="company-name">${c.name}</h3>
            <p class="company-copy">${c.copy}</p>
            <div class="company-stats">
              ${c.stats.map(s => `
                <div class="stat"><span class="stat-num" data-count="${s.count}">0</span><span class="stat-unit">${s.unit}</span><span class="stat-label">${s.label}</span></div>
              `).join('')}
            </div>
            <div class="company-chips">
              ${c.chips.map(chip => `<span class="chip">${chip}</span>`).join('')}
            </div>
          </article>
        `).join('');
      }

      function renderCerts() {
        const timeline = document.querySelector('.cert-timeline');
        if (!timeline) return;
        const articlesHTML = certs.map(c => `
          <article class="cert-step" data-step="${c.step}" style="--cert-color:${c.color}">
            <div class="cert-node">
              <svg class="cert-node-ring" viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 6" class="cert-node-rotate"/>
              </svg>
              <span class="cert-icon" aria-hidden="true">${c.icon}</span>
              <span class="cert-num">${c.step}</span>
            </div>
            <span class="cert-level">${c.level}</span>
            <h3 class="cert-title">${c.title}</h3>
            <ul class="cert-list">
              ${c.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </article>
        `).join('');
        // Append after the existing .cert-track wrapper, preserving track-fill
        timeline.insertAdjacentHTML('beforeend', articlesHTML);
      }

      /* ============ 9. Initialization ============ */
      renderEdges();
      renderNodes();
      renderDots();
      renderCompanies();
      renderCerts();
      setActive(0);

      // Scan all text nodes in the body for glossary terms on page load
      formatElementText(document.body);
      bindGlossaryTerms(document.body);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeQuiz();
          closeInfographic();
          closeNewsModal();
          closeAiModal();
        }
      });

      // ===== Animated stat counters (count from 0 when scrolled into view) =====
      (function initStatCounters() {
        const stats = Array.from(document.querySelectorAll('.stat-num[data-count]'));
        const companiesSection = document.getElementById('section-companies');
        if (!stats.length) return;
        const formatNum = (n) => n >= 1000 ? n.toLocaleString('en-US') : String(n);
        const activeAnimations = new WeakMap();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const animate = (el, target, duration = 1400) => {
          const runId = Symbol('stat-counter-run');
          activeAnimations.set(el, runId);
          el.textContent = '0';

          if (prefersReducedMotion) {
            el.textContent = formatNum(target);
            return;
          }

          const start = performance.now();
          const tick = (now) => {
            if (activeAnimations.get(el) !== runId) return;
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = formatNum(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };

        const playStats = () => {
          stats.forEach((stat, index) => {
            const target = parseInt(stat.dataset.count, 10) || 0;
            window.setTimeout(() => animate(stat, target), index * 70);
          });
        };

        const resetStats = () => {
          stats.forEach(stat => {
            activeAnimations.set(stat, null);
            stat.textContent = '0';
          });
        };

        let replayTimer = null;
        const replayStats = (delay = 0) => {
          if (replayTimer) window.clearTimeout(replayTimer);
          resetStats();
          replayTimer = window.setTimeout(() => {
            replayTimer = null;
            playStats();
          }, delay);
        };

        if (companiesSection) {
          let isCompaniesVisible = false;
          document.querySelectorAll('.side-nav-dot[data-target="section-companies"], a[href="#section-companies"]').forEach(link => {
            link.addEventListener('click', () => replayStats(260));
          });

          const io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.target !== companiesSection) continue;
              if (entry.isIntersecting && !isCompaniesVisible) {
                isCompaniesVisible = true;
                replayStats();
              } else if (!entry.isIntersecting && isCompaniesVisible) {
                isCompaniesVisible = false;
                resetStats();
              }
            }
          }, { threshold: 0.35 });

          resetStats();
          io.observe(companiesSection);
          return;
        }

        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) {
              activeAnimations.set(e.target, null);
              e.target.textContent = '0';
              continue;
            }
            const target = parseInt(e.target.dataset.count, 10) || 0;
            animate(e.target, target);
          }
        }, { threshold: 0.6 });
        stats.forEach(s => io.observe(s));
      })();

      // ===== Cert-timeline progress line fills on scroll-in =====
      (function initCertTimeline() {
        const timeline = document.querySelector('.cert-timeline');
        if (!timeline) return;
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              timeline.classList.add('is-revealed');
              io.disconnect();
              break;
            }
          }
        }, { threshold: 0.35 });
        io.observe(timeline);
      })();

      // ===== Side-nav active highlighting via IntersectionObserver =====
      (function initSideNav() {
        const dots = document.querySelectorAll('.side-nav-dot');
        if (!dots.length) return;
        const dotByTarget = new Map();
        dots.forEach(d => dotByTarget.set(d.dataset.target, d));

        const targets = Array.from(dotByTarget.keys())
          .map(id => document.getElementById(id))
          .filter(Boolean);
        if (!targets.length) return;

        // Track which sections are currently in viewport; pick the one whose
        // top is closest to (but not past) the middle of the viewport.
        const visible = new Map();
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
            else visible.delete(e.target.id);
          }
          if (visible.size === 0) return;
          // pick the section with the largest intersection ratio
          let bestId = null, bestRatio = -1;
          for (const [id, ratio] of visible) {
            if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
          }
          if (!bestId || performance.now() < sideNavKeyboardLockUntil) return;
          const bestIndex = Array.from(dots).findIndex(d => d.dataset.target === bestId);
          if (bestIndex >= 0) sideNavKeyboardIndex = bestIndex;
          dots.forEach(d => d.classList.toggle('is-active', d.dataset.target === bestId));
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

        targets.forEach(t => io.observe(t));
      })();
