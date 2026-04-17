# FocusFlow - AI 驱动的工作流自动化平台

FocusFlow 是一个智能工作流自动化平台，结合 AI 能力与直观设计，解决真实的生产力痛点。专为面临邮件过载、会议疲劳和任务管理碎片化的现代知识工作者打造。

## 🎯 项目定位 - 解决的核心痛点

现代职场人士面临三大关键挑战：

1. **信息过载** - 每天 100+ 封邮件，无法有效筛选优先级
2. **会议疲劳** - 每天 4-5 个会议，决策丢失，行动项被遗忘
3. **上下文切换** - 任务散落在邮件、Slack、日历、笔记各处

FocusFlow 通过理解上下文的 AI 驱动自动化，减少认知负荷，解决这些痛点。

---

## ✨ 8大核心功能

### 1. AI 智能优先级收件箱
使用多因子 AI 分析的智能邮件优先级排序：
- **紧急度检测** - 识别时间敏感的邮件
- **发件人重要性** - 从你的互动模式学习
- **内容分析** - 提取关键主题和行动项
- **0-100 优先级评分** - 可视化优先级指示器

### 2. 自然语言创建工作流
通过简单描述即可创建复杂工作流：
- "每天早上9点总结我的未读邮件"
- "当我收到老板的紧急邮件时，发送通知给我"
- 无需编码，AI 将意图转化为自动化

### 3. 智能会议助手
端到端会议智能：
- **实时转录** - 本地录音，保护隐私
- **决策提取** - 自动捕捉关键决策
- **行动项跟踪** - 识别任务、负责人和截止日期
- **自动生成纪要** - 可分享的会议总结
- **跟进提醒** - 不错过任何承诺

### 4. AI 回复生成器
智能邮件回复生成：
- **语气选择** - 专业、友好或简洁
- **上下文感知** - 理解邮件线程上下文
- **可编辑输出** - 发送前审查和修改
- **一键重新生成** - 获取替代回复

### 5. 工作流模板市场
常见场景的预构建自动化模板：
- 晨间摘要（每日邮件总结）
- 紧急提醒（即时通知）
- 周报（自动总结）
- 客户跟进（CRM 自动化）
- 发票追踪（财务自动化）

### 6. 智能冲突检测
AI 驱动的工作流分析：
- **循环依赖检测** - 防止无限循环
- **资源竞争检测** - 识别竞争工作流
- **时间重叠分析** - 优化调度
- **冗余操作检测** - 消除重复

### 7. AI 工作流优化器
持续改进建议：
- **性能优化** - 并行化 API 调用
- **成本降低** - 建议更便宜的 AI 模型
- **可靠性改进** - 添加错误处理
- **简化建议** - 降低复杂度

### 8. 实时通知中心
上下文感知警报系统：
- **工作流状态更新** - 成功/失败通知
- **智能过滤** - 基于优先级的通知路由
- **可操作警报** - 直接链接到相关操作

### 9. 执行历史与分析
全面的工作流监控：
- **时间轴视图** - 可视化执行历史
- **成功率跟踪** - 性能指标
- **错误分析** - 故障调查
- **导出功能** - 报告生成

---

## 🏗️ 技术架构

### 后端技术栈
- **框架**: FastAPI (Python 3.11+)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **任务队列**: Celery + Redis
- **AI 集成**: OpenAI GPT-3.5/4，带规则回退
- **认证**: JWT 认证

### 前端技术栈
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS v4
- **构建工具**: Vite
- **状态管理**: React Hooks
- **图标**: Lucide React

### 核心服务架构
```
┌─────────────────────────────────────────┐
│           FocusFlow 平台                 │
├─────────────────────────────────────────┤
│  API 层 (FastAPI)                       │
│  ├── 认证服务                            │
│  ├── 工作流引擎                          │
│  ├── AI 服务                             │
│  │   ├── 优先级分析                      │
│  │   ├── 回复生成                        │
│  │   ├── 会议分析                        │
│  │   └── NLP 处理                        │
│  ├── 冲突检测                            │
│  └── 优化引擎                            │
├─────────────────────────────────────────┤
│  任务队列 (Celery + Redis)               │
│  └── 定时工作流执行                      │
├─────────────────────────────────────────┤
│  数据库 (SQLite/PostgreSQL)              │
│  └── 工作流与用户数据                    │
└─────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+
- Redis (Celery 任务队列)

### 后端部署

```bash
cd focusflow/backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
cp .env.example .env
# 编辑 .env 填入你的 OpenAI API 密钥

# 初始化数据库
python -c "from app.core.database import init_db; init_db()"

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端部署

```bash
cd focusflow/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### Celery Worker（定时工作流）

```bash
cd focusflow/backend

# 启动 Celery worker
celery -A app.core.celery_app worker --loglevel=info

# 启动 Celery beat（调度器）
celery -A app.core.celery_app beat --loglevel=info
```

---

## 📁 项目结构

```
focusflow/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py          # 认证接口
│   │   │       │   ├── workflows.py     # 工作流接口
│   │   │       │   ├── priority.py      # 优先级分析
│   │   │       │   ├── reply.py         # 回复生成
│   │   │       │   ├── meetings.py      # 会议助手
│   │   │       │   ├── conflicts.py     # 冲突检测
│   │   │       │   ├── optimizer.py     # 优化建议
│   │   │       │   └── templates.py     # 模板市场
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── config.py                # 配置管理
│   │   │   ├── database.py              # 数据库连接
│   │   │   └── celery_app.py            # Celery 配置
│   │   ├── models/
│   │   │   └── workflow.py              # 数据模型
│   │   ├── services/
│   │   │   ├── priority_service.py      # 优先级服务
│   │   │   ├── reply_service.py         # 回复服务
│   │   │   ├── meeting_service.py       # 会议服务
│   │   │   ├── conflict_service.py      # 冲突检测服务
│   │   │   ├── optimizer_service.py     # 优化服务
│   │   │   └── template_service.py      # 模板服务
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx            # 仪表盘
│   │   │   ├── Inbox.tsx                # 收件箱
│   │   │   ├── PriorityInbox.tsx        # 优先级收件箱
│   │   │   ├── AIReply.tsx              # AI 回复
│   │   │   ├── MeetingAssistant.tsx     # 会议助手
│   │   │   ├── WorkflowList.tsx         # 工作流列表
│   │   │   ├── NaturalLanguageCreator.tsx  # 自然语言创建
│   │   │   ├── TemplateMarket.tsx       # 模板市场
│   │   │   ├── ConflictDetector.tsx     # 冲突检测
│   │   │   ├── AIOptimizer.tsx          # AI 优化器
│   │   │   ├── ExecutionHistory.tsx     # 执行历史
│   │   │   ├── NotificationCenter.tsx   # 通知中心
│   │   │   └── Sidebar.tsx              # 侧边栏
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🔑 API 文档

### 认证接口
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册

### 工作流接口
- `GET /api/v1/workflows/` - 获取所有工作流
- `POST /api/v1/workflows/` - 创建新工作流
- `PUT /api/v1/workflows/{id}` - 更新工作流
- `DELETE /api/v1/workflows/{id}` - 删除工作流
- `POST /api/v1/workflows/{id}/execute` - 执行工作流

### AI 服务接口
- `POST /api/v1/priority/analyze` - 分析邮件优先级
- `POST /api/v1/reply/generate` - 生成邮件回复
- `POST /api/v1/nlp/parse` - 自然语言解析为工作流
- `POST /api/v1/meetings/analyze` - 分析会议记录

### 分析与优化接口
- `GET /api/v1/conflicts/analyze` - 检测工作流冲突
- `GET /api/v1/optimizer/analyze/{id}` - 获取优化建议
- `GET /api/v1/templates/` - 获取工作流模板

---

## 🎨 设计理念

### 极简主义 UI
- 无不必要的说明文字
- 暗色主题，一致的配色方案
- 玻璃态效果，现代感
- 功能优先于装饰

### 用户中心
- 自然语言交互
- 上下文感知建议
- 渐进式复杂度展示
- 一键操作常见任务

### 隐私优先
- 尽可能本地处理
- 敏感操作不保留数据
- 透明的 AI 决策过程

---

## 🔮 未来路线图

### Phase 2（近期）
- [ ] 多语言支持（中文、英文、日文）
- [ ] 高级工作流分支（条件判断）
- [ ] 团队协作功能（共享工作流）
- [ ] 移动端 App（iOS/Android）

### Phase 3（中期）
- [ ] 集成市场（Slack、Notion、飞书、钉钉）
- [ ] 高级分析仪表盘（数据可视化）
- [ ] 自定义 AI 模型训练
- [ ] 企业 SSO（单点登录）

### Phase 4（远期）
- [ ] AI 工作流推荐（基于用户行为）
- [ ] 语音控制界面
- [ ] 实时协作编辑
- [ ] 私有化部署方案

---

## 🤝 贡献指南

我们欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

## 🙏 致谢

- OpenAI 提供 GPT API
- FastAPI 团队提供优秀框架
- Tailwind CSS 提供原子化样式
- Lucide 提供精美图标

---

用 ❤️ 为生产力爱好者打造
