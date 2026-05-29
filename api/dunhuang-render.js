// dunhuang-render.js （替换原 image-edit.js 或新增）
// 使用 Node.js 内置 fetch，无需安装依赖
const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

// 敦煌八大风格配置
const STYLE_CONFIGS = {
    '反弹琵琶': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将人物照片转换为敦煌壁画中飞天反弹琵琶的风格。人物保持原貌，四周环绕飞天、飘带飞舞，背景融入敦煌壁画元素，色彩以土红、石绿、金色为主，具有千年壁画质感。',
        negative_prompt: '低质量，模糊，变形，现代服饰，写实照片，背景杂乱，卡通'
    },
    '供养人像': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将人物转化为晚唐敦煌供养人像风格。身着华丽唐代服饰，手持鲜花，身后呈现原色敦煌壁画，线条细腻，色彩饱满，带有宗教庄严感。',
        negative_prompt: '低质量，现代服装，表情夸张，背景单调，二次元'
    },
    '千佛光相': {
        model: 'qwen-image-edit-max',
        positive_prompt: '面部居中，四周千佛呈放射状光相排列，融合敦煌千佛洞元素，光线柔和而神圣，人物面部保持清晰，整体如佛光普照。',
        negative_prompt: '模糊，变形，光线暗淡，不对称，佛像扭曲'
    },
    '九色鹿缘': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将人物融入九色鹿本生故事场景，背景为赭红山峦，人物化为故事中角色，保留敦煌壁画特有的装饰性风格，色彩鲜艳。',
        negative_prompt: '低质量，现代元素，动物变形，背景脱离壁画风格'
    },
    '藻井天顶': {
        model: 'qwen-image-edit-max',
        positive_prompt: '头像化为敦煌藻井图案中心，四周铺开联珠纹、莲花纹、卷草纹，对称华丽，色彩以深红、金、绿为主，极具装饰性。',
        negative_prompt: '不对称，纹样粗糙，人物特征丢失，现代感'
    },
    '丝路驼影': {
        model: 'qwen-image-edit-max',
        positive_prompt: '人物化为西域商贾形象，头戴胡帽，牵骆驼，背景为沙漠落日与丝路古城，带有敦煌壁画中商旅图的色感与氛围。',
        negative_prompt: '现代交通工具，表情冷漠，背景城市'
    },
    '金刚怒目': {
        model: 'qwen-image-edit-max',
        positive_prompt: '人物面部转化为护法金刚风格，棱角分明，身绕火焰纹，表情威严，保留敦煌金刚力士的造型特征，色彩强烈。',
        negative_prompt: '柔和表情，女性化，火焰模糊，失去人物辨识度'
    },
    '斑驳千年': {
        model: 'qwen-image-edit-max',
        positive_prompt: '人物半隐于斑驳剥落的壁画墙面中，叠加岁月肌理、裂纹和褪色效果，仿佛已存在千年，保持人物轮廓可辨。',
        negative_prompt: '高清干净，新壁画感，无纹理，过于清晰'
    }
};

module.exports = async (req, res) => {
    // 设置 CORS 头和内容类型
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!API_KEY) {
        return res.status(500).json({
            success: false,
            error: 'API 密钥未配置，请联系管理员设置环境变量 DASHSCOPE_API_KEY'
        });
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            endpoint: '敦煌幻境 AI 飞天照相馆 API',
            method: 'POST',
            description: '上传人像图片并选择敦煌风格进行AI融合',
            availableStyles: Object.keys(STYLE_CONFIGS),
            parameters: {
                style_name: 'string (required) - 风格名称（见availableStyles）',
                image_base64: 'string (required) - base64编码的图片数据'
            }
        });
    }

    if (req.method === 'POST') {
        try {
            const { style_name, image_base64 } = req.body;

            if (!style_name || !image_base64) {
                return res.status(400).json({
                    success: false,
                    error: '缺少必要参数: style_name 和 image_base64'
                });
            }

            if (!STYLE_CONFIGS[style_name]) {
                return res.status(400).json({
                    success: false,
                    error: `不支持的风格: ${style_name}`,
                    available_styles: Object.keys(STYLE_CONFIGS)
                });
            }

            const styleConfig = STYLE_CONFIGS[style_name];

            // 确保 base64 格式正确
            let imageData = image_base64;
            if (!image_base64.startsWith('data:image/')) {
                imageData = `data:image/jpeg;base64,${image_base64}`;
            }

            const requestBody = {
                model: styleConfig.model,
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { image: imageData },
                                { text: styleConfig.positive_prompt }
                            ]
                        }
                    ]
                },
                parameters: {
                    n: 1,
                    negative_prompt: styleConfig.negative_prompt,
                    size: '1024*1024',
                    prompt_extend: true,
                    watermark: false
                }
            };

            // 调用阿里云 API
            const response = await fetch(`${BASE_URL}/services/aigc/multimodal-generation/generation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(60000)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `阿里云API返回错误: ${response.status}`);
            }

            const content = data?.output?.choices?.[0]?.message?.content;
            let imageUrl = null;

            if (Array.isArray(content)) {
                for (const item of content) {
                    if (item.image) {
                        imageUrl = typeof item.image === 'string' ? item.image : item.image.url;
                        break;
                    }
                }
            }

            if (!imageUrl) {
                throw new Error('未找到生成的图片URL');
            }

            return res.status(200).json({
                success: true,
                imageUrl: imageUrl,
                style: style_name,
                request_id: data.request_id
            });

        } catch (error) {
            console.error('API调用错误:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message || '图像处理失败'
            });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
};