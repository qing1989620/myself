/**
 * 将陈勇搏的简历内容写入数据库（覆盖式：先清空 skills / experiences 再重建）
 *
 * 用法：
 *   npx tsx prisma/seed-resume.ts
 *
 * 说明：
 *   - 源文件路径通过环境变量 RESUME_PDF 传入，复制到 data/uploads/ 后写入 resumePdf
 *   - 简历内容与 PDF 原文一致；技能熟练度为按项目技术栈的估算值，可在 /admin/resume 调整
 */
import { config as dotenvConfig } from "dotenv"
import path from "path"
import fs from "fs"
import crypto from "crypto"

dotenvConfig({ path: path.resolve(__dirname, "..", ".env.local"), override: false })
dotenvConfig({ path: path.resolve(__dirname, "..", ".env"), override: false })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

if (!process.env.DATABASE_URL) {
  console.error("未找到 DATABASE_URL，请在 .env 或 .env.local 中配置")
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL!.replace("file:", "")
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const root = path.resolve(__dirname, "..")

/** 1. 复制简历 PDF 到 data/uploads/（文件名需匹配 /uploads/resume-{id}.pdf） */
function installPdf(): string | null {
  const src = process.env.RESUME_PDF
  if (!src || !fs.existsSync(src)) {
    console.warn("未提供 RESUME_PDF 或文件不存在，跳过 PDF 安装")
    return null
  }
  const uploadDir = path.join(root, "data", "uploads")
  fs.mkdirSync(uploadDir, { recursive: true })

  // 删除旧的简历文件
  const old = fs.readdirSync(uploadDir).filter((f) => /^resume-[A-Za-z0-9-]+\.pdf$/.test(f))
  for (const f of old) fs.unlinkSync(path.join(uploadDir, f))

  const filename = `resume-${crypto.randomUUID()}.pdf`
  fs.copyFileSync(src, path.join(uploadDir, filename))
  console.log("PDF 已安装:", filename)
  return `/uploads/${filename}`
}

const profileData = {
  name: "陈勇搏",
  title: "Python 后端开发 / AI 智能体应用",
  email: "2976982852@qq.com",
  phone: "19896209412",
  location: "湖南省长沙市",
  avatar: null,
  birthDate: "2006.11.18",
  birthplace: "",
  degree: "本科",
  political: "共青团员",
  selfEvaluation:
    "技术复合型开发者，深耕 Python 后端与 AI 应用：具备从 RESTful API、RAG 检索管线到 LLM 智能体集成、本地大模型私有化部署的完整经验，并独立开源 OMMW 数学建模工作流、paper-skill 论文工程引擎、AI 编程工程工作流三个 MIT 协议项目。累计获国家级 AI、机器人、数学建模与数据类竞赛奖项 6 项（含全国一等奖 2 项），兼具严密的算法逻辑与较强的工程落地能力，致力于用精简高效的架构解决复杂业务问题。\nGitHub：https://github.com/qing1989620",
  jobTarget: "Python 后端开发 / AI 智能体应用（实习或校招）",
  jobSummary: "",
  hobbies: "",
}

const skills = [
  { name: "Python 后端开发", level: 90 },
  { name: "多智能体工作流 / Skill 工程", level: 88 },
  { name: "FastAPI / SQLAlchemy", level: 85 },
  { name: "LLM 智能体与 MCP 集成", level: 85 },
  { name: "RAG 检索增强（BGE / Chroma）", level: 85 },
  { name: "机器学习与可解释建模（LightGBM / SHAP）", level: 80 },
  { name: "PostgreSQL / Redis", level: 80 },
  { name: "大模型私有化部署（vLLM / AWQ）", level: 78 },
  { name: "C / C++ / Java", level: 70 },
]

const experiences = [
  {
    type: "education",
    title: "湖南工商大学",
    subtitle: "人工智能（本科）",
    startDate: "2024.07",
    endDate: "2028.06",
    description:
      "主修课程：高等数学、线性代数、C 语言、Java、Python、机器学习与深度学习、数据结构、计算机组成原理、操作系统、计算机网络原理、大数据技术基础、自然语言处理",
    techStack: null,
    image: null,
  },
  {
    type: "internship",
    title: "湖南赤道银河科技有限公司（立理 AI）",
    subtitle: "实习生 · AI 科学家系统「立理 S1」",
    startDate: "2026",
    endDate: "至今",
    description:
      "赤道银河是专注 AI for Science 的国家高新技术企业，核心产品「立理 AI」覆盖学术搜索、文献研读、文献综述与科研知识库，2025 年在首届国际人工智能科学家大会（ICAIS 2025）AI 科学家挑战赛文献综述赛道从全球 101 支队伍中夺得全球冠军。实习期间参与「立理 S1」AI 科学家系统（s1.liliai.cn）研发：该系统以 Graph Engineering 架构把课题规划、方案设计、编码实验、技术评审、方案评审、成果撰写组织为一张可循环、可回退的多智能体协作图，封装 300+ 专业科研工作流与 Skills，支持百小时级长程科研任务与独立沙箱执行验证。",
    techStack: "多智能体协作 · Graph Engineering · 科研 Workflow / Skill 工程 · 计算沙箱",
    image: null,
  },
  {
    type: "competition",
    title: "睿抗机器人开发者大赛（RAICOM）全国一等奖",
    subtitle: "CAIP 强脑赛道 · 智海算法调优竞赛项目",
    startDate: "2026.04",
    endDate: "2026.08",
    description:
      "由工业和信息化部人才交流中心主办，连续多年入选《全国普通高校大学生竞赛排行榜》的 A 类赛事。全国总决赛「智海算法调优竞赛项目」要求对复杂气象场景下的多类别图像做智能分类，并在有限算力约束下完成数据清洗、网络重构、模型轻量化与精度—速度平衡等工程化调优，依托浙江大学智海 Mo 平台（momodel.cn）线上开发与自动评测。\n参赛队伍：陈勇搏、蒋喆、陈威霖 ｜ 指导老师：张超龙 ｜ 证书编号：IITCHJRAIC26011368（2026.08.03 颁发）",
    techStack: "Python · PyTorch · 计算机视觉 · 模型轻量化 · 智海 Mo 平台",
    image: "/certificates/raicom-2026-national-first-prize.jpg",
  },
  {
    type: "competition",
    title: "大学生数据要素大赛 全国一等奖",
    subtitle: "参赛作品 FruitScope「果境数鉴」· 已上线 fruitscope.cn",
    startDate: "2025.09",
    endDate: "2025.12",
    description:
      "以数据要素开发应用与企业真实场景命题，考察数据处理、分析挖掘与实战决策能力。作品 FruitScope「果境数鉴」围绕果园生产数据搭建风险监测—诊断—推演—防控的闭环决策工作台，融合气象、土壤、病虫害等多源数据输出风险预警与防控建议；独立完成系统开发并部署上线，支持账号登录与决策任务流转。\n系统已上线：https://fruitscope.cn ｜ 预警算法开源：https://github.com/qing1989620/crop",
    techStack: "多源数据融合 · 风险预警建模 · Web 全栈 · 云服务器部署",
    image: null,
  },
  {
    type: "competition",
    title: "全球校园人工智能算法精英大赛（AIC）全国二等奖",
    subtitle: "第七届 · 算法挑战赛赛题七：AI 算法在新材料未知相指标化中的应用（晶胞参数预测）",
    startDate: "2025.06",
    endDate: "2025.12",
    description:
      "赛题源自新材料晶体结构解析的真实需求：粉末 XRD 指标化是结构解析的第一步，需将衍射峰序列转化为晶面指数并反推晶胞参数。数据集由 Crystallography Open Database 真实数据模拟生成，叠加零点漂移、样品偏移等系统性误差与随机噪声，并随机插入无标注杂质峰。要求在强干扰下同时优化晶胞参数回归精度（RMSE）与晶面指数匹配率（Accuracy）。\n参赛队伍：陈达沛、陈勇搏、陈颖超 ｜ 指导教师：徐雪松、宋明月 ｜ 证书编号：2025-AIC-GM265D5PR（2025.12 颁发）",
    techStack: "Python · PyTorch · XRD 衍射信号处理 · 回归 + 分类多任务学习 · 鲁棒特征提取",
    image: "/certificates/aic-7th-challenge-second-prize.jpg",
  },
  {
    type: "competition",
    title: "MathorCup 数学应用挑战赛 全国二等奖",
    subtitle: "第十六届（2026）· C 题：中老年人群高血脂症的风险预警及干预方案优化",
    startDate: "2026.04",
    endDate: "2026.06",
    description:
      "基于 1000 例多源异构样本（中医九种体质积分、ADL/IADL 活动能力量表、血常规与代谢指标），完成三步建模：筛选表征痰湿严重度与高血脂风险的关键指标并量化九种体质的贡献度；构建低/中/高三级风险预警模型并给出可解释的分层阈值；在总成本不超过 2000 元、6 个月的约束下，为痰湿体质患者求解个性化干预方案。\n参赛队员：陈勇搏、杨雅玉、杨宇 ｜ 指导老师：王勇 ｜ 证书编号：MC2600573（2026.06 颁发）",
    techStack: "Python · LASSO / 随机森林 / Logistic 回归 · SHAP 可解释性 · 整数规划与动态规划",
    image: "/certificates/mathorcup-2026-c-second-prize.png",
  },
  {
    type: "competition",
    title: "启智杯机器智能大赛 算法赛道三等奖",
    subtitle: "2026 年度第四届 · 命题：纤量智检——工业小样本缺陷检测算法",
    startDate: "2025.10",
    endDate: "2026.05",
    description:
      "由浙江、江苏、上海、安徽四省市仪器仪表学会联合主办，海康机器人与中国计量大学承办，本届覆盖全国 204 所院校、1206 支团队，仅 36 支晋级全国总决赛。算法赛道聚焦工业小样本印刷缺陷检测，要求在动态换型、标注样本极少（甚至仅依赖正常样本）的条件下实现多类别多形态缺陷的快速精准检测，决赛现场需完成数据采集、清洗、调参、验证与模型部署全流程。\n参赛队伍：DL_cyh（陈勇搏、杨雅玉、何怡静）｜ 指导老师：刘振坤、赵海裕 ｜ 2026.05.24 颁发",
    techStack: "Python · 深度学习 · 小样本缺陷检测 · 异常检测 · 海康 VM 生态",
    image: "/certificates/qizhibei-4th-algorithm-third-prize.jpg",
  },
  {
    type: "competition",
    title: "中国机器人及人工智能大赛 全国三等奖",
    subtitle: "第二十八届 · 机器人任务挑战赛（微型无人机）",
    startDate: "2026.07",
    endDate: "",
    description:
      "在第二十八届中国机器人及人工智能大赛全国总决赛中，于机器人任务挑战赛（微型无人机）赛项完成飞控调试与任务流程实现，获全国三等奖；同期另获省级、校级竞赛奖项若干。\n参赛队伍：李亦浛、陈威霖、陈勇搏 ｜ 指导老师：郁军伟、陈欢 ｜ 证书编号：CRAIC2026-NF-W3HESE（2026.07 颁发）",
    techStack: "嵌入式调试 · 无人机飞控 · 任务规划",
    image: "/certificates/craic-28th-micro-uav-third-prize.png",
  },
  {
    type: "project",
    title: "OMMW · 开放数学建模工作流（开源 · MIT）",
    subtitle: "作者 · 面向 AI 智能体的反幻觉数学建模工作流",
    startDate: "2026.08",
    endDate: "至今",
    description:
      "一个可移植、本地优先、反幻觉的数学建模工作流，LaTeX + Word 双输出。不是提示词集合，而是真实的 Python 核心：Pydantic 状态 Schema、校验器、双格式渲染器、双模式一致性门控、反幻觉测试与 CI。核心理念是「论文不是事实源，Research Core（机器可读账本）才是」，让虚构数字、虚假引用、「没编译就说 PDF 已就绪」这类失败直接打挂构建。\n已实现九个层次：竞赛合规（比赛 profile 检测与官方规则缓存、LIVE 模式当届解题内容搜索硬门控、页面预算、AI 使用账本）→ 数据审计 → 模型发现（问题类型路由 + baseline 强制）→ 实验实验室（experiment.yaml 预注册、结果落盘）→ 结果验证（单位/范围/统计诚实/独立复核）→ 可视化 → 论文工厂（章节契约、一致性图与过期传播、表格工厂）→ 出版提交。\n工程质量：pytest 41/41、负面用例基准 15/15、doctor 分层环境诊断（PASS/WARN/FAIL）、smoke 端到端通过。\n开源地址：https://github.com/qing1989620/workbuddy-modex",
    techStack: "Python · Pydantic · LaTeX / Word 双渲染 · CLI · pytest / CI · MIT",
    image: null,
  },
  {
    type: "project",
    title: "paper-skill · 研究论文工程引擎（开源 · MIT）",
    subtitle: "作者 · AI 智能体插件：从研究项目到可投稿论文",
    startDate: "2026.08",
    endDate: "至今",
    description:
      "把研究仓库变成可审计、可投稿的稿件，且每条论断都有证据支撑。不是「输入标题就出论文」的生成器，而是「研究项目 → 证据 → 稿件」的工程系统：先调查、再验证、最后才写，拒绝为不存在的结果编故事。\n覆盖 17 阶段状态机（PHASE 0-16）与 7 个专家子智能体：项目取证与版本溯源（按内容而非文件名判断哪个才是最新稿）、数据完整性与 10 点泄漏红队、可复现性重跑、文献矩阵与最近工作矩阵（零虚构引用 + 撤稿检查）、创新性红队、故事线评分、预注册统计分析、缺失实验检测（只给可执行方案、绝不模拟结果）、图表脚本化生成、双语稿件与数字一致性校验（自研 verify_consistency.py 抽取正文数字与主结果表交叉核对）、期刊模板运行时抓取（不打包版权模板）、8 个评审角色 + 对抗性 Reviewer #2、以及由门禁状态计算出的投稿就绪裁决。\n开源地址：https://github.com/qing1989620/paper-skill",
    techStack: "Python · Agent Skill / 插件架构 · LaTeX / DOCX · 状态机与质量门禁 · MIT",
    image: null,
  },
  {
    type: "project",
    title: "AI 编程工程工作流（开源 · MIT）",
    subtitle: "作者 · 可审计、低幻觉、低冗余的 AI 编程流程",
    startDate: "2026.08",
    endDate: "至今",
    description:
      "用工程化流程替代「直接写代码」：任务自动分类 → 建立契约 → 可执行计划 → 最小实现 → 真实验证 → 双审查 → 质量门禁，最后才允许宣称完成。核心信念是 Evidence Before Claims：所有「完成」声明必须来自刚刚真实执行的验证结果，无法验证只能标注 NOT VERIFIED。\n针对 LLM 编码的典型失败做了硬约束：不捏造 API / 不捏造测试结果 / 不隐藏失败；Simplicity First + Surgical Changes 抑制过度设计与顺手改无关代码；指令信任层级防御把 README、issue、网页内容当高权限指令执行的注入风险；脏工作区保护避免覆盖用户未提交的工作。任务按 7 类（TRIVIAL / FEATURE / BUG / REFACTOR / PERFORMANCE / SECURITY / UI）路由，配套安全门禁、简洁门禁、完整验证、证据门禁四级质量门禁，以及 12 组自带 evals（含反幻觉、反过度工程、提示注入、脏工作区保护场景）。供应链侧对 6 个上游仓库锁定 commit SHA，禁止静默自动更新。\n开源地址：https://github.com/qing1989620/AI-coding-skill",
    techStack: "Python / PowerShell · Agent Skill（Control Plane） · Evals · 供应链审计 · MIT",
    image: null,
  },
  {
    type: "project",
    title: "拾阶 · 智能学习闭环平台",
    subtitle: "独立开发 · 后端架构与全模块 + 配套前端",
    startDate: "2025.11",
    endDate: "至今",
    description:
      "面向「课堂 → 练习 → 巩固」完整数据链的智能学习平台，前后端独立工程、可单独部署，前端仅通过 REST + WebSocket 通信。\n后端：FastAPI + SQLAlchemy 2 + Alembic + Pydantic v2，JWT（access + rotating refresh）与 Argon2id 口令哈希；LLM / ASR / OCR / 对象存储 / 题源全部 Provider 化，可替换实现；业务链路为事务性的 Attempt → Mastery → MemoryState → ReviewTask，内置基于 FSRS-4.5 的 MemoryEngine 与 ReviewPlanner 做复习调度；30+ 张表，异步 Job 执行配合 Transactional Outbox 保证一致性；契约冻结导出 openapi.json / asyncapi.yaml，配套 37 个集成与单元测试。Docker Compose 一键起 PostgreSQL + Redis + MinIO + backend。\n仓库：https://github.com/qing1989620/shijie-backend ｜ https://github.com/qing1989620/shijie-frontend",
    techStack: "FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · PostgreSQL · Redis · MinIO · Docker · JWT",
    image: null,
  },
  {
    type: "project",
    title: "“知序（zhixu）”学习知识归纳与规划系统",
    subtitle: "后端技术开发（独立负责后端架构与全模块）",
    startDate: "2025.04",
    endDate: "2025.10",
    description:
      "独立负责后端架构与全模块开发（FastAPI + SQLAlchemy + PostgreSQL + Redis）：构建“上传解析→分段→BGE 向量化→Chroma 检索”RAG 管线，SSE 流式问答并附引用溯源；实现 AI 出题判分、苏格拉底式辅导与学习报告；对接 TCN 知识追踪引擎与 LEKT 先修矩阵，输出知识图谱与个性化学习路径；集成内嵌 Agent 框架（工具调用 / MCP）与多 Key 池 LLM 网关。基于 vLLM 在 RTX 6000 上部署 Qwen3-32B（AWQ INT4 量化），提供 OpenAI 兼容接口，数据全私有化。",
    techStack:
      "FastAPI · SQLAlchemy · PostgreSQL · Redis · Chroma · BGE · SSE · vLLM · Qwen3-32B（AWQ INT4） · MCP",
    image: null,
  },
  {
    type: "project",
    title: "FruitScope 果园病虫害风险预警与防控可视化看板（开源）",
    subtitle: "独立开发 · 数据要素大赛获奖作品的技术实现",
    startDate: "2025.09",
    endDate: "2025.12",
    description:
      "基于 LightGBM + SHAP 的智能预警系统与企业级可视化大屏：空间风险热力图与地块级详情、时间趋势分析与防控窗口判定、SHAP 特征贡献可解释性、POSI 精准防控策略推荐、三级差异化防控响应体系，并支持模拟实时数据刷新。除本地看板外另部署 Web 版决策工作台 fruitscope.cn。\n开源地址：https://github.com/qing1989620/crop ｜ 在线看板：https://fruitscope.cn",
    techStack: "Python · LightGBM · SHAP · Streamlit · Plotly",
    image: null,
  },
  {
    type: "project",
    title: "微信个人号 AI 自动回复机器人（开源）",
    subtitle: "作者 · 不注入、不 Hook、不逆向协议的实现路线",
    startDate: "2026.06",
    endDate: "2026.07",
    description:
      "面向微信 4.x Windows 客户端的个人号 AI 自动回复：读取本地加密数据库（SQLCipher）轮询发现新消息，调用任意 OpenAI 兼容 API 生成回复，再用 Windows UI 自动化模拟键盘输入发出，人设通过 System Prompt 自定义。技术取舍上刻意不注入、不 Hook、不逆向协议，并内置降险设计：群聊默认不自动回、不响应自己与系统号、回复前 3~8 秒随机延迟与同联系人冷却、只处理文本消息。\n开源地址：https://github.com/qing1989620/weixinchat-auto",
    techStack: "Python · Windows UI 自动化 · SQLCipher · OpenAI 兼容 API",
    image: null,
  },
  {
    type: "practice",
    title: "甲骨易语言科技有限公司",
    subtitle: "数据标注员",
    startDate: "2025.12.02",
    endDate: "2025.12.16",
    description:
      "依托 itag 平台开展图片轨迹指令匹配与轨迹点标注，严格遵循标注规范与样本废弃判定标准。累计完成 8000+ 张图片标注，指令匹配准确率达 90%，单图平均标注时长 25 秒，样本废弃率控制在 5% 以内。",
    techStack: null,
    image: null,
  },
  {
    type: "campus",
    title: "学校 AI 与机器人协会",
    subtitle: "副社长",
    startDate: "",
    endDate: "",
    description:
      "参与社团组织与运营，牵头技术方向的分享与竞赛组队，带动成员参与 AI 与机器人相关赛事及项目实践。",
    techStack: null,
    image: null,
  },
  {
    type: "campus",
    title: "学院文艺部",
    subtitle: "副部长",
    startDate: "",
    endDate: "",
    description:
      "负责学院文艺活动的组织与统筹，参与节目编排、人员协调与现场执行。",
    techStack: null,
    image: null,
  },
  {
    type: "campus",
    title: "助理辅导员",
    subtitle: "学生工作助理",
    startDate: "",
    endDate: "",
    description:
      "协助辅导员处理日常学生事务与班级管理，承担通知传达、材料整理与同学沟通等工作。",
    techStack: null,
    image: null,
  },
  {
    type: "certificate",
    title: "海康机器人 机器视觉开发工程师认证（2D 视觉 · HCA），有效期至 2028.05",
    subtitle: null,
    startDate: null,
    endDate: null,
    description: null,
    techStack: null,
    image: "/certificates/hikrobot-machine-vision-engineer.png",
  },
  {
    type: "certificate",
    title: "大学英语四级 / 六级（CET-4/6），具备良好的听说读写能力",
    subtitle: null,
    startDate: null,
    endDate: null,
    description: null,
    techStack: null,
    image: null,
  },
  {
    type: "certificate",
    title: "全国计算机二级，熟练运用 WPS 相关软件",
    subtitle: null,
    startDate: null,
    endDate: null,
    description: null,
    techStack: null,
    image: null,
  },
]

async function main() {
  const resumePdf = installPdf()

  const existing = await prisma.resumeProfile.findFirst()

  const fields = {
    ...profileData,
    // 未安装新 PDF 时保留原有值
    resumePdf: resumePdf ?? existing?.resumePdf ?? null,
  }

  const profile = existing
    ? await prisma.resumeProfile.update({ where: { id: existing.id }, data: fields })
    : await prisma.resumeProfile.create({ data: fields })
  console.log("简历档案已写入:", profile.name, `#${profile.id}`)

  await prisma.resumeSkill.deleteMany({ where: { profileId: profile.id } })
  await prisma.resumeExperience.deleteMany({ where: { profileId: profile.id } })

  await prisma.resumeSkill.createMany({
    data: skills.map((s, i) => ({ ...s, sortOrder: i, profileId: profile.id })),
  })

  await prisma.resumeExperience.createMany({
    data: experiences.map((e, i) => ({ ...e, sortOrder: i, profileId: profile.id })),
  })

  const counts = {
    技能: skills.length,
    经历: experiences.length,
    PDF: resumePdf ? "已绑定" : "未绑定",
  }
  console.log("完成:", JSON.stringify(counts, null, 0))
}

main()
  .catch((e) => {
    console.error("写入失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
