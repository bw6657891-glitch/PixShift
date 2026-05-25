// 使用 Node.js 内置 fetch，无需安装任何依赖
const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

const STYLE_CONFIGS = {
    '美漫风': {
        model: 'qwen-image-edit-2.0',
        positive_prompt: '将图片转换为美国漫画风格，强调高对比度、粗轮廓线、明亮色彩和强烈阴影。保持原图主体、构图和内容完全不变，只改变艺术表现方式。',
        negative_prompt: '低质量，模糊，变形，不自然，写实照片感，黑白照片，水彩'
    },
    '人像优化': {
        model: 'qwen-image-2.0',
        positive_prompt: '对人物肖像进行专业美化处理，提升皮肤质感、眼神光、自然光影过渡，使人物更加立体生动。保持人物面部特征和整体构图不变。',
        negative_prompt: '过度磨皮，塑料感，失真，背景虚化过度，锐化过度'
    },
    '城市景观': {
        model: 'qwen-image-edit-2.0',
        positive_prompt: '将城市照片增强为具有视觉冲击力的艺术化城市景观，强化建筑线条、光影对比，提升色彩饱和度和天空细节。保持原图结构不变。',
        negative_prompt: '低质量，模糊，变形，不自然，人物干扰，杂乱'
    },
    '电影感': {
        model: 'qwen-image-edit-2.0',
        positive_prompt: '为图片添加电影级质感，包括柔光滤镜、电影级色调、浅景深效果和宽银幕比例暗示。保持内容不变。',
        negative_prompt: '低质量，模糊，变形，不自然，普通拍照感，过曝，欠曝'
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

    // 检查 API 密钥（在请求处理时检查，而不是启动时）
    if (!API_KEY) {
        return res.status(500).json({
            success: false,
            error: 'API 密钥未配置，请联系管理员设置环境变量 DASHSCOPE_API_KEY'
        });
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            endpoint: 'AI图像编辑API',
            method: 'POST',
            description: '上传图片并选择风格进行AI渲染',
            availableStyles: Object.keys(STYLE_CONFIGS),
            parameters: {
                style_name: 'string (required) - 风格名称',
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

            // 使用内置 fetch 调用阿里云 API
            const response = await fetch(`${BASE_URL}/services/aigc/multimodal-generation/generation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(60000) // 60秒超时
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
