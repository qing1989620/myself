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
  title: "Python 后端开发 / AI 应用",
  email: "2976982852@qq.com",
  phone: "19896209412",
  location: "湖南省长沙市",
  avatar: null,
  birthDate: "2006.11.18",
  birthplace: "",
  degree: "本科",
  political: "共青团员",
  selfEvaluation:
    "技术复合型开发者，深耕 Python 后端与 AI 应用，具备从 RESTful API 开发到 LLM 智能体集成、本地大模型私有化部署的完整经验。多次斩获国家级 AI、数模、机器人与数据类竞赛奖项，兼具严密的算法逻辑与极强的代码攻坚能力，致力于用精简高效的架构解决复杂业务需求。",
  jobTarget: "Python 后端开发 / AI 应用开发（实习）",
  jobSummary: "",
  hobbies: "",
}

const skills = [
  { name: "Python 后端开发", level: 90 },
  { name: "FastAPI / SQLAlchemy", level: 85 },
  { name: "RAG 检索增强（BGE / Chroma）", level: 85 },
  { name: "LLM 智能体与 MCP 集成", level: 82 },
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
      "以数据要素开发应用与企业真实场景命题，考察数据处理、分析挖掘与实战决策能力。作品 FruitScope「果境数鉴」围绕果园生产数据搭建风险监测—诊断—推演—防控的闭环决策工作台，融合气象、土壤、病虫害等多源数据输出风险预警与防控建议；独立完成系统开发并部署上线，支持账号登录与决策任务流转。",
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
    endDate: "",
    description:
      "基于 1000 例多源异构样本（中医九种体质积分、ADL/IADL 活动能力量表、血常规与代谢指标），完成三步建模：筛选表征痰湿严重度与高血脂风险的关键指标并量化九种体质的贡献度；构建低/中/高三级风险预警模型并给出可解释的分层阈值；在总成本不超过 2000 元、6 个月的约束下，为痰湿体质患者求解个性化干预方案。",
    techStack: "Python · LASSO / 随机森林 / Logistic 回归 · SHAP 可解释性 · 整数规划与动态规划",
    image: null,
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
    title: "“知序（zhixu）”学习知识归纳与规划系统",
    subtitle: "后端技术开发（独立负责后端架构与全模块）",
    startDate: "2025-04",
    endDate: "至今",
    description:
      "独立负责后端架构与全模块开发（FastAPI + SQLAlchemy + PostgreSQL + Redis）：构建“上传解析→分段→BGE 向量化→Chroma 检索”RAG 管线，SSE 流式问答并附引用溯源；实现 AI 出题判分、苏格拉底式辅导与学习报告；对接 TCN 知识追踪引擎与 LEKT 先修矩阵，输出知识图谱与个性化学习路径；集成内嵌 Agent 框架（工具调用 / MCP）与多 Key 池 LLM 网关。基于 vLLM 在 RTX 6000 上部署 Qwen3-32B（AWQ INT4 量化），提供 OpenAI 兼容接口，数据全私有化。",
    techStack:
      "FastAPI · SQLAlchemy · PostgreSQL · Redis · Chroma · BGE · SSE · vLLM · Qwen3-32B（AWQ INT4） · MCP",
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
