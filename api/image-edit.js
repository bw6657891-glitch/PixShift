const axios = require('axios');

// 阿里云API配置 —— 密钥仅从环境变量读取，绝不硬编码
const API_KEY = process.env.DASHSCOPE_API_KEY;
if (!API_KEY) {
    throw new Error('未配置环境变量 DASHSCOPE_API_KEY，无法启动服务');
}
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

// 风格配置
const STYLE_CONFIGS = {
    '徽州生宣': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将图片转换为中国传统水墨画风格，使用徽州生宣纸质感。墨色自然晕染，宣纸纹理清晰可见。保持原图的主体、构图和内容完全不变，只改变绘画风格和纸张纹理。',
        negative_prompt: '低质量，模糊，变形，不自然，现代风格，西方绘画，油画，水彩画，彩色照片，3D渲染'
    },
    '贵州皮纸': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将图片转换为中国传统水墨画风格，使用贵州皮纸质感。体现粗犷纤维纹理和枯笔飞白效果。保持原图的主体、构图和内容完全不变，只改变绘画风格和纸张纹理。',
        negative_prompt: '低质量，模糊，变形，不自然，现代风格，西方绘画，油画，水彩画，彩色照片，3D渲染，光滑表面'
    },
    '棠岙竹纸': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将图片转换为中国传统水墨画风格，使用棠岙竹纸质感。体现细腻竹纤维和温润米黄色纸面。保持原图的主体、构图和内容完全不变，只改变绘画风格和纸张纹理。',
        negative_prompt: '低质量，模糊，变形，不自然，现代风格，西方绘画，油画，水彩画，彩色照片，3D渲染，粗糙纹理'
    },
    '西北毛边': {
        model: 'qwen-image-edit-max',
        positive_prompt: '将图片转换为中国传统水墨画风格，使用西北毛边纸质感。体现纸质松软和边缘自然毛糙感。保持原图的主体、构图和内容完全不变，只改变绘画风格和纸张纹理。',
        negative_prompt: '低质量，模糊，变形，不自然，现代风格，西方绘画，油画，水彩画，彩色照片，3D渲染，整齐边缘'
    }
};

module.exports = async (req, res) => {
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 处理GET请求 - 返回API信息
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            endpoint: '图像编辑API',
            method: 'POST',
            description: '上传图片进行古法造纸风格转换',
            availableStyles: Object.keys(STYLE_CONFIGS),
            parameters: {
                style_name: 'string (required) - 风格名称',
                image_base64: 'string (required) - base64编码的图片数据'
            },
            example: {
                style_name: '徽州生宣',
                image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
            }
        });
    }

    // 处理POST请求
    if (req.method === 'POST') {
        try {
            console.log('收到图像编辑请求');

            const { style_name, image_base64 } = req.body;

            // 验证参数
            if (!style_name || !image_base64) {
                return res.status(400).json({
                    success: false,
                    error: '缺少必要参数: style_name 和 image_base64 都是必需的'
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

            // 处理base64数据
            let imageData = image_base64;
            if (!image_base64.startsWith('data:image/')) {
                imageData = `data:image/jpeg;base64,${image_base64}`;
            }

            // 构建请求体
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
                    watermark: true
                }
            };

            // 调用阿里云API
            const response = await axios.post(
                `${BASE_URL}/services/aigc/multimodal-generation/generation`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30秒超时
                }
            );

            // 提取图片URL
            const content = response.data?.output?.choices?.[0]?.message?.content;
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

            // 返回成功结果
            return res.status(200).json({
                success: true,
                imageUrl: imageUrl,
                model: styleConfig.model,
                style: style_name,
                request_id: response.data.request_id,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('API调用错误:', error.message);

            let errorMsg = '图像处理失败';
            let statusCode = 500;

            if (error.response?.data) {
                errorMsg = error.response.data.message || errorMsg;
                if (error.response.data.code === 'InvalidApiKey') {
                    errorMsg = 'API密钥无效';
                    statusCode = 401;
                }
            }

            return res.status(statusCode).json({
                success: false,
                error: errorMsg,
                details: error.response?.data || error.message
            });
        }
    }

    // 其他HTTP方法
    res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
};
