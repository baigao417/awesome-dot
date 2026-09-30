// 界面文案四语字典。收录正文（data/catalog.json）与任务草案保持中文原文，不在这里翻译。
export const languages = [
  { id: 'zh', short: '中', name: '简体中文', html: 'zh-CN' },
  { id: 'en', short: 'EN', name: 'English', html: 'en' },
  { id: 'ja', short: '日', name: '日本語', html: 'ja' },
  { id: 'ko', short: '한', name: '한국어', html: 'ko' },
];

const zh = {
  title: 'Awesome Dot - 案例与项目导航',
  description: 'Awesome Dot：OpenAI dots 官方案例、社区项目和开发资源导航。每条收录都有来源与 Dot 的具体角色。',
  home: 'Awesome Dot 首页', mainNav: '主导航', explore: '探索案例', saved: '我的收藏', standards: '收录标准', github: 'GitHub 发现', submit: '提交项目',
  language: '界面语言', toLight: '切换到明亮模式', toDark: '切换到暗黑模式',
  official: '认识 OpenAI dots', h1a: '有了一个 7×24 小时的赛博员工，', h1b: '可以让它做什么？', lead: '看看社区在做什么，把持续跟进、创作和协作交给你的 Dot。', local: '本地时间', indexed: '条收录',
  statsLabel: '收录统计', statItems: '案例与项目', statOfficial: '官方场景示例', statRepos: '公开仓库', statChecked: '来源核验',
  categories: '分类', categoryNav: '用途分类', sideTitle: '你也做了 Dot 项目？', sideText: '给它一个位置，让更多人发现。', sideSubmit: '提交收录',
  resultsLabel: '发现案例', searchPlaceholder: '搜案例、项目、作者或用途…', searchLabel: '搜索案例、项目、作者或用途', clearSearch: '清空搜索', filter: '筛选', kindLabel: '收录类型', allKinds: '所有类型', resetFilters: '重置筛选', all: '全部',
  discover: '发现案例', mySaved: '我的收藏', sort: '排序', sortCurated: '编辑精选', sortStars: 'GitHub Stars', sortName: '名称排序',
  footer: 'Awesome Dot · 非官方社区导航，与 OpenAI 无隶属关系', exportData: '导出目录',
  close: '关闭',
  aboutIntro: '这里收录 OpenAI dots 的官方场景与相关公开项目。',
  standardList: [['官方场景', '来自 OpenAI 官方文档的使用场景。'], ['社区项目', '社区开发、与 Dot 相关的公开项目。'], ['开发资源', '插件、MCP 等搭建 Dot 应用的工具。'], ['独立替代', '其他 Agent 实现方案，单独归类。']],
  formName: '项目或案例名称', formUrl: '公开项目／案例链接', formRole: 'Dot 在这里做什么？', formEvidence: '证据链接', formEvidenceHint: '固定版本源码、官方文档或公开演示',
  formNote: '当前生成本地收录草稿，不向任何平台发送信息。公开仓库配置后可通过 PR／Issue 投稿。', formDownload: '下载收录草稿',
  cat: { all: '全部收录', coding: '代码与产品反馈', content: '内容与创作', operations: '业务与团队协作', research: '研究与数据分析', automation: '监控与持续跟进', integrations: '插件与 MCP', learning: '指南与资源库', agents: '独立 Agent 方案' },
  kind: { official_case: '官方场景', community_project: '社区项目', building_block: '开发资源', alternative: '独立替代' },
  save: '收藏', unsave: '取消收藏', dotRole: 'DOT 在这里做什么', altRole: '与 DOT 的关系', viewDetail: '查看详情',
  emptySavedTitle: '这里还没有匹配的收藏', emptyTitle: '没有找到匹配的收录', emptySavedText: '收藏的案例会保存在这个浏览器。', emptyText: '试试其他用途或项目名称。',
  roleHeading: 'Dot 的具体角色', altHeading: '与 Dot 的关系', outcome: '能得到什么', requirements: '开始前需要', sources: '来源', officialDoc: 'OpenAI 官方场景文档',
  copyTask: '复制任务草案', viewRepo: '查看仓库', copyLink: '复制案例链接',
  copied: '已复制', clipboardFallback: '剪贴板不可用，已下载文本', exported: '已导出目录', storageOff: '浏览器存储不可用，收藏仅保留在本次会话', badUrl: '请使用公开 HTTP 或 HTTPS 链接', drafted: '收录草稿已下载',
};

const en = {
  title: 'Awesome Dot - Case and project directory',
  description: 'Awesome Dot: a directory of official OpenAI dots examples, community projects and development resources. Each entry includes its sources and the specific role of Dot.',
  home: 'Awesome Dot homepage', mainNav: 'Primary navigation', explore: 'Explore', saved: 'My saved', standards: 'Listing standards', github: 'GitHub finds', submit: 'Submit',
  language: 'Display language', toLight: 'Use light mode', toDark: 'Use dark mode',
  official: 'About OpenAI dots', h1a: 'You have a 24/7 AI employee.', h1b: 'What can it do for you?', lead: 'Browse what the community is doing and let your Dot handle ongoing follow-up, creation and collaboration.', local: 'Local time', indexed: 'entries',
  statsLabel: 'Listing statistics', statItems: 'Cases and projects', statOfficial: 'Official use cases', statRepos: 'Public repositories', statChecked: 'Source verification',
  categories: 'Categories', categoryNav: 'Categories by use', sideTitle: 'Have a Dot project too?', sideText: 'List it so more people can discover it.', sideSubmit: 'Submit for listing',
  resultsLabel: 'Find cases', searchPlaceholder: 'Search by case, project, author or use…', searchLabel: 'Search by case, project, author or use', clearSearch: 'Clear query', filter: 'Filters', kindLabel: 'Listing type', allKinds: 'Any type', resetFilters: 'Reset selection', all: 'All',
  discover: 'Find cases', mySaved: 'My saved', sort: 'Order', sortCurated: 'Editorial selection', sortStars: 'GitHub Stars', sortName: 'Name order',
  footer: 'Awesome Dot · An unofficial community directory with no affiliation to OpenAI', exportData: 'Export catalog',
  close: 'Close',
  aboutIntro: 'We list official OpenAI dots use cases and related public projects.',
  standardList: [['Official use cases', 'Use cases from official OpenAI documentation.'], ['Community projects', 'Public projects built by the community and related to Dot.'], ['Development resources', 'Tools for building Dot applications, including plugins and MCP.'], ['Independent alternatives', 'Other Agent implementations, listed separately.']],
  formName: 'Name of project or case', formUrl: 'Public link to project or case', formRole: 'What is Dot doing here?', formEvidence: 'Link to evidence', formEvidenceHint: 'Source code at a fixed version, official documentation or a public demonstration',
  formNote: 'A local listing draft is generated for now; no information is sent to any platform. Submissions via PR / Issue will be available once the public repository is configured.', formDownload: 'Download listing draft',
  cat: { all: 'Every entry', coding: 'Code and product feedback', content: 'Content and creative work', operations: 'Business and team collaboration', research: 'Research and data analysis', automation: 'Monitoring and ongoing follow-up', integrations: 'Plugins and MCP', learning: 'Guides and resource libraries', agents: 'Independent Agent solutions' },
  kind: { official_case: 'Official use', community_project: 'Community', building_block: 'Dev material', alternative: 'Indep. alt.' },
  save: 'Save', unsave: 'Unsave', dotRole: 'What DOT does here', altRole: 'Connection to DOT', viewDetail: 'Details',
  emptySavedTitle: 'No saved cases match', emptyTitle: 'No listed entries match', emptySavedText: 'Saved cases are stored in this browser.', emptyText: 'Try a different use or project name.',
  roleHeading: 'The specific role of Dot', altHeading: 'Connection to Dot', outcome: 'Expected output', requirements: 'Needed to start', sources: 'Sources', officialDoc: 'Official OpenAI use-case documentation',
  copyTask: 'Copy draft task', viewRepo: 'Open repository', copyLink: 'Copy case link',
  copied: 'Copy complete', clipboardFallback: 'The clipboard is unavailable; the text has been downloaded', exported: 'Catalog export complete', storageOff: 'Browser storage is unavailable; saved cases are kept only for this session', badUrl: 'Use a publicly accessible HTTP or HTTPS link', drafted: 'Listing draft downloaded',
};

const ja = {
  title: 'Awesome Dot - 事例・プロジェクト案内',
  description: 'Awesome Dot は、OpenAI dots の公式事例、コミュニティのプロジェクト、開発資料を案内します。各掲載項目に出典と Dot の具体的な役割を示しています。',
  home: 'Awesome Dot トップ', mainNav: '主要ナビゲーション', explore: '事例探索', saved: '保存一覧', standards: '収録基準', github: 'GitHub 発見', submit: '投稿',
  language: '画面の言語', toLight: 'ライト表示に変更', toDark: 'ダーク表示に変更',
  official: 'OpenAI dots の紹介', h1a: '7×24時間働くAI社員がいたら、', h1b: '何を任せる？', lead: 'コミュニティの活動を見ながら、継続的なフォロー、創作、共同作業を自分の Dot に任せてみませんか。', local: 'ローカル時刻', indexed: '件の掲載',
  statsLabel: '収録統計', statItems: '事例・プロジェクト', statOfficial: '公式の利用例', statRepos: '公開リポジトリ', statChecked: '出典の照合',
  categories: '分類', categoryNav: '用途別分類', sideTitle: 'Dot プロジェクトを作りましたか？', sideText: '掲載して、より多くの人が見つけられるようにします。', sideSubmit: '収録申請',
  resultsLabel: '事例探索', searchPlaceholder: '事例・プロジェクト・作者・用途を検索…', searchLabel: '事例・プロジェクト・作者・用途の検索', clearSearch: '検索語の消去', filter: '条件', kindLabel: '収録種別', allKinds: '全種別', resetFilters: '条件の初期化', all: '全件',
  discover: '事例探索', mySaved: '保存一覧', sort: '表示順', sortCurated: '編集部選定', sortStars: 'GitHub Stars', sortName: '名称順',
  footer: 'Awesome Dot · 非公式のコミュニティ案内サイトであり、OpenAI に所属していません', exportData: '目録のエクスポート',
  close: '閉じる',
  aboutIntro: 'OpenAI dots の公式の利用例と関連する公開プロジェクトを収録しています。',
  standardList: [['公式の利用例', 'OpenAI の公式文書に掲載された利用例。'], ['コミュニティのプロジェクト', 'コミュニティが開発した、Dot に関連する公開プロジェクト。'], ['開発資料', 'プラグインや MCP など、Dot アプリを構築するためのツール。'], ['独立した代替案', 'その他の Agent 実装を独立した分類で掲載。']],
  formName: 'プロジェクト名・事例名', formUrl: '公開プロジェクト・事例へのリンク', formRole: 'Dot がここで行うこと', formEvidence: '証拠へのリンク', formEvidenceHint: '固定バージョンのソースコード、公式文書、公開デモ',
  formNote: '現時点ではローカルの収録草稿を作成し、どのプラットフォームにも情報を送信しません。公開リポジトリの設定後は PR / Issue で投稿できます。', formDownload: '収録草稿のダウンロード',
  cat: { all: '全収録項目', coding: 'コード・製品へのフィードバック', content: 'コンテンツ・創作', operations: '業務・チーム共同作業', research: '研究・データ分析', automation: '監視・継続フォロー', integrations: 'プラグイン・MCP', learning: 'ガイド・資料集', agents: '独立した Agent の方式' },
  kind: { official_case: '公式事例', community_project: 'コミュニティ', building_block: '開発資料', alternative: '独立型代替' },
  save: '保存', unsave: '保存取消', dotRole: 'DOT がここで行うこと', altRole: 'DOT との関連', viewDetail: '詳細',
  emptySavedTitle: '条件に合う保存項目はありません', emptyTitle: '条件に合う収録項目はありません', emptySavedText: '保存した事例は、このブラウザに保管されます。', emptyText: 'ほかの用途やプロジェクト名で検索してみてください。',
  roleHeading: 'Dot の具体的な担当', altHeading: 'Dot との関連', outcome: '得られる成果', requirements: '開始前の準備', sources: '出典', officialDoc: 'OpenAI 公式の利用例文書',
  copyTask: 'タスク草稿のコピー', viewRepo: 'リポジトリ表示', copyLink: '事例リンクのコピー',
  copied: 'コピー済み', clipboardFallback: 'クリップボードを利用できないため、テキストをダウンロードしました', exported: '目録をエクスポートしました', storageOff: 'ブラウザの保存領域を利用できないため、保存項目は今回のセッション中のみ保持します', badUrl: '公開の HTTP または HTTPS リンクを使用してください', drafted: '収録草稿をダウンロードしました',
};

const ko = {
  title: 'Awesome Dot - 사례 및 프로젝트 안내',
  description: 'Awesome Dot은 OpenAI dots 공식 사례, 커뮤니티 프로젝트, 개발 자료를 안내합니다. 각 수록 항목에 출처와 Dot이 맡는 구체적인 역할을 명시합니다.',
  home: 'Awesome Dot 첫 화면', mainNav: '주 탐색 메뉴', explore: '사례 탐색', saved: '내 저장함', standards: '등재 기준', github: 'GitHub 탐색', submit: '제출',
  language: '화면 언어', toLight: '밝은 모드 전환', toDark: '어두운 모드 전환',
  official: 'OpenAI dots 소개', h1a: '7×24시간 일하는 AI 직원,', h1b: '무엇을 맡길까요?', lead: '커뮤니티의 활동을 살펴보고 지속적인 후속 관리, 창작, 협업을 자신의 Dot에 맡겨 보십시오.', local: '로컬 시간', indexed: '개 수록',
  statsLabel: '등재 통계', statItems: '사례 및 프로젝트', statOfficial: '공식 활용 예시', statRepos: '공개 저장소', statChecked: '출처 검증',
  categories: '분류', categoryNav: '용도별 분류', sideTitle: 'Dot 프로젝트도 만드셨습니까?', sideText: '등재하여 더 많은 사람이 발견할 수 있도록 합니다.', sideSubmit: '등재 신청',
  resultsLabel: '사례 찾기', searchPlaceholder: '사례·프로젝트·제작자·용도로 검색…', searchLabel: '사례·프로젝트·제작자·용도 검색', clearSearch: '검색어 삭제', filter: '조건', kindLabel: '등재 유형', allKinds: '전체 유형', resetFilters: '조건 초기화', all: '전체',
  discover: '사례 찾기', mySaved: '내 저장함', sort: '표시 순서', sortCurated: '편집부 선정', sortStars: 'GitHub Stars', sortName: '이름 순',
  footer: 'Awesome Dot · 비공식 커뮤니티 안내 사이트로, OpenAI에 소속되어 있지 않습니다', exportData: '목록 내보내기',
  close: '닫기',
  aboutIntro: 'OpenAI dots의 공식 활용 사례와 관련 공개 프로젝트를 등재합니다.',
  standardList: [['공식 활용 사례', 'OpenAI 공식 문서에 소개된 활용 사례.'], ['커뮤니티 프로젝트', '커뮤니티가 개발한 Dot 관련 공개 프로젝트.'], ['개발 자료', '플러그인, MCP 등 Dot 앱을 만드는 도구.'], ['독립 대안', '다른 Agent 구현 방식을 별도로 분류.']],
  formName: '프로젝트명 또는 사례명', formUrl: '공개 프로젝트 또는 사례 링크', formRole: 'Dot이 여기서 하는 일', formEvidence: '증거 링크', formEvidenceHint: '고정 버전 소스 코드, 공식 문서 또는 공개 시연',
  formNote: '현재는 로컬 등재 초안을 생성하며 어떤 플랫폼에도 정보를 보내지 않습니다. 공개 저장소를 설정한 후 PR / Issue를 통해 제출할 수 있습니다.', formDownload: '등재 초안 다운로드',
  cat: { all: '모든 수록 항목', coding: '코드 및 제품 피드백', content: '콘텐츠 및 창작', operations: '비즈니스 및 팀 협업', research: '연구 및 데이터 분석', automation: '모니터링 및 지속 관리', integrations: '플러그인 및 MCP', learning: '가이드 및 자료 모음', agents: '독립 Agent 방식' },
  kind: { official_case: '공식 사례', community_project: '커뮤니티', building_block: '개발 자료', alternative: '독립 대안' },
  save: '저장', unsave: '저장 해제', dotRole: 'DOT이 여기서 하는 일', altRole: 'DOT과의 관련성', viewDetail: '상세',
  emptySavedTitle: '조건에 맞는 저장 항목이 없습니다', emptyTitle: '조건에 맞는 수록 항목이 없습니다', emptySavedText: '저장한 사례는 이 브라우저에 보관합니다.', emptyText: '다른 용도나 프로젝트명으로 검색해 보십시오.',
  roleHeading: 'Dot이 맡는 구체적인 역할', altHeading: 'Dot과의 관련성', outcome: '얻는 결과', requirements: '시작 전 준비 사항', sources: '출처', officialDoc: 'OpenAI 공식 활용 사례 문서',
  copyTask: '작업 초안 복사', viewRepo: '저장소 열기', copyLink: '사례 링크 복사',
  copied: '복사 완료', clipboardFallback: '클립보드를 사용할 수 없어 텍스트를 다운로드했습니다', exported: '목록 내보내기를 완료했습니다', storageOff: '브라우저 저장소를 사용할 수 없어 저장 항목은 현재 세션 동안만 유지합니다', badUrl: '공개된 HTTP 또는 HTTPS 링크를 사용하십시오', drafted: '등재 초안을 다운로드했습니다',
};

Object.assign(zh, {
  draw: '抽张灵感卡', drawAgain: '再抽一张', inspiration: '灵感卡', drawOpen: '看看这个案例', drawPool: n => `${n} 条匹配收录`, drawEmpty: '当前筛选没有可抽取的收录',
  daily: '今日一见', dailyOpen: '看看今天的发现', tagsLabel: '标签', tagAny: '任一标签', tagAll: '全部标签', starsLabel: 'GitHub Stars', starsAny: '不限星数', sourceOnly: '有源码审阅', activeFilters: '已选条件', removeFilter: '移除此条件',
  maintainer: '维护者', follow: '关注白告', github: 'Star on GitHub', issueSubmit: '通过 Issue 投稿', pullRequest: '查看贡献方式', formNote: '可下载本地草稿，或前往公开仓库提交 Issue。',
});
Object.assign(en, {
  draw: 'Draw inspiration', drawAgain: 'Draw another', inspiration: 'Inspiration card', drawOpen: 'Explore this case', drawPool: n => `${n} matching entries`, drawEmpty: 'No entries match these filters',
  daily: 'Daily discovery', dailyOpen: 'Explore today\'s pick', tagsLabel: 'Tags', tagAny: 'Any tag', tagAll: 'All tags', starsLabel: 'GitHub Stars', starsAny: 'Any star count', sourceOnly: 'Source reviewed', activeFilters: 'Active filters', removeFilter: 'Remove filter',
  maintainer: 'Maintainer', follow: 'Follow Baigao', github: 'Star on GitHub', issueSubmit: 'Submit an Issue', pullRequest: 'Contribution guide', formNote: 'Download a local draft or submit an Issue in the public repository.',
});
Object.assign(ja, {
  draw: 'ひらめきカード', drawAgain: 'もう一枚', inspiration: 'ひらめきカード', drawOpen: 'この事例を見る', drawPool: n => `${n} 件の該当項目`, drawEmpty: '条件に合う項目がありません',
  daily: '今日の発見', dailyOpen: '今日の項目を見る', tagsLabel: 'タグ', tagAny: 'いずれかのタグ', tagAll: 'すべてのタグ', starsLabel: 'GitHub Stars', starsAny: '星数を問わない', sourceOnly: 'ソース確認済み', activeFilters: '選択した条件', removeFilter: '条件を解除',
  maintainer: '運営者', follow: '白告をフォロー', github: 'Star on GitHub', issueSubmit: 'Issue で投稿', pullRequest: '投稿の手引き', formNote: 'ローカルの草稿をダウンロードするか、公開リポジトリの Issue で投稿できます。',
});
Object.assign(ko, {
  draw: '영감 카드 뽑기', drawAgain: '한 장 더', inspiration: '영감 카드', drawOpen: '이 사례 보기', drawPool: n => `${n}개 일치 항목`, drawEmpty: '조건에 맞는 항목이 없습니다',
  daily: '오늘의 발견', dailyOpen: '오늘의 항목 보기', tagsLabel: '태그', tagAny: '태그 중 하나', tagAll: '모든 태그', starsLabel: 'GitHub Stars', starsAny: '별 수 제한 없음', sourceOnly: '소스 검토됨', activeFilters: '선택한 조건', removeFilter: '조건 해제',
  maintainer: '관리자', follow: '白告 팔로우', github: 'Star on GitHub', issueSubmit: 'Issue로 제출', pullRequest: '기여 안내', formNote: '로컬 초안을 내려받거나 공개 저장소에 Issue로 제출할 수 있습니다.',
});
export const dictionaries = { zh, en, ja, ko };
