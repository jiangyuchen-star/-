# 高考英语讲题助手（gaokao-english-coach）

一个 [Agent Skills](https://code.claude.com/docs/en/skills) 规范的高考英语讲题技能：让 AI 以一位资深高考英语老师的身份、方法体系和课堂口吻来讲题、答疑、做学习规划。

> **免责声明**：本技能是学习者个人整理的**方法笔记**，内容蒸馏自公开课程视频的机器转写字幕，仅供学习交流使用，不代表任何真实教师或机构观点。方法是否有效因人而异，请结合自身情况判断。如有侵权请联系删除。

## 它会怎么讲题

- **先破误区再讲方法**："英语靠语感""单词记不住"——先把认知误区点破
- **答案必须给依据链**：原文哪一句、哪条规则、哪个重复现象
- **出题人视角**：每道题先回答"出题人想考什么、在哪儿挖了坑"
- **错误选项贴标签**：无中生有 / 偷换概念 / 以偏概全 / 过度推理 / 原词陷阱
- **口吻有实测密度**：口头禅频率按 200 万字课程转写稿的词频统计校准（如"对吧"约 20 次/万字）

## 覆盖题型与话题

| 话题 | 方法库 |
|---|---|
| 阅读理解（说明文/议论文/记叙文/应用文） | reading.md |
| 完形填空（名词/动词/形副/连介规则系统） | cloze.md |
| 七选五（选项锚点类型、挖空命题学） | seven-choose-five.md |
| 语法填空（谓语非谓语判定链、冠词一条规则） | grammar-fill.md |
| 背单词（分层、三分类标注、遍数法） | vocab.md |
| 听力口语（听写三遍法、跟读） | listening.md |
| 错题分析（自问自答八问法、四类题范例） | mistakes.md |
| 复习规划/提分策略（分档开方、硬时间线） | studyplan.md |
| 应用文写作（六大类型、必背句式、主题素材） | writing.md |
| 读后续写（情节类型、情感四层描写、17个主题公式） | continuation.md |
| 概要写作（六环节模板、五大逻辑词） | summary-writing.md |
| 带刷题/讲评试卷（逐题讲题节奏、真题示范） | walkthroughs.md |

## 安装

### Claude Code / 命令行编码工具

把 `skills/gaokao-english-coach/` 整个目录复制到技能目录：

```bash
# Claude Code
cp -r skills/gaokao-english-coach ~/.claude/skills/

# Command Code
cp -r skills/gaokao-english-coach ~/.commandcode/skills/
```

之后对话中贴出英语题目、长难句，或问学习方法即可触发；也可以显式调用 `/gaokao-coach`。

## 字幕采集工具（tools/）

`tools/fetch_subtitles.mjs` 可批量抓取B站视频的 AI 字幕（ai-zh）并保存为带时间戳的转写稿——本仓库的方法库就是用这条管线从课程视频蒸馏出来的。

```bash
# SESSDATA 从浏览器登录B站后的 Cookie 里取（AI 字幕仅登录用户可见）
BILI_SESSDATA=你的SESSDATA node tools/fetch_subtitles.mjs BV1xxx BV1yyy
```

说明：
- 需要 Node.js 18+（内置 fetch）
- 多P视频自动逐P抓取；无 AI 字幕的视频会跳过
- 字幕为机器转写，存在识别错误，蒸馏时应结合上下文校正
- 抓取的课程转写稿属于课程内容，**请勿公开传播**，仅限个人学习

## 目录结构

```
├── skills/gaokao-english-coach/   # 技能本体（SKILL.md + 12 份方法库）
├── tools/fetch_subtitles.mjs      # B站 AI 字幕采集脚本
└── README.md
```

## License

代码部分 MIT；方法库内容为学习笔记（见顶部免责声明）。
