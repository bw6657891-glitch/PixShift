// api/dunhuang-render.js
// PixShift — AI Photo Style Transfer API
// 使用 Node.js 内置 fetch，无需额外安装依赖

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

const STYLE_CONFIGS = {
    'photo-abstract-editorial': {
        name: '极简抽象',
        name_en: 'Photo Abstract Editorial',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into a refined minimalist abstract editorial image.

Do not keep the original photograph as a separate element.
Do not add panels, collages, or side-by-side compositions.

Reinterpret the entire image as an abstract visual composition inspired by
contemporary photography books and art magazines.

Extract and simplify the primary colors, shapes, negative space, and visual rhythm
from the original photograph, then rebuild the scene in a clean, abstract editorial style.

Use restrained asymmetry, generous whitespace, subtle geometric forms, organic fragments,
and a sense of quiet visual balance.

All colors must be derived from the original photograph.

You may add exactly one small, restrained English title containing 2 to 5 words,
rendered in subtle editorial typography.

Overall feeling:
minimalist, sophisticated, quiet, contemporary, photographic,
high-end editorial design, museum catalogue, photography book.

The final image should be a new, standalone abstract work,
not a reproduction of the original photo.
`,
        negative_prompt: `
generic illustration,
cartoon,
vector art,
infographic,
poster,
thumbnail,
random geometric shapes,
unrelated colors,
excessive decoration,
overly symmetrical layout,
heavy typography,
large text,
multiple titles,
fantasy elements,
anime,
3D rendering,
low quality,
blurry face,
distorted person,
changed identity,
duplicate person,
deformed anatomy,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo,
photo background,
photo layers,
text overlay,
watermark
`
    },
    'classical-painting': {
        name: '中国古画',
        name_en: 'Chinese Classical Painting',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into an elegant Chinese classical painting.

Re-render the entire image using the visual language of traditional Chinese painting:
ink wash, mineral pigments, rice paper texture, elegant brushwork,
controlled outlines, atmospheric empty space, and poetic composition.

The final image should look like a genuine traditional Chinese painting,
not a photograph with a filter, and not a collage.

If the original contains a person, preserve their recognizable facial features and pose,
but adapt clothing, texture, background, and rendering entirely into the classical painting style.

Use restrained traditional colors such as ink black, warm paper,
muted mineral green, ochre, muted red, and subtle blue.

Sophisticated, historical, quiet, and artistic.
`,
        negative_prompt: `
photorealistic,
modern photography,
anime,
cartoon,
digital illustration,
3D rendering,
neon colors,
oversaturated colors,
Western fantasy,
modern objects,
distorted face,
changed identity,
deformed hands,
low quality,
blurry,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo,
photo background,
photo layers
`
    },
    'american-comic': {
        name: '美式漫画',
        name_en: 'American Comic',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into a sophisticated American comic-book illustration.

Completely redraw the image in a modern American comic / graphic novel style.

Use confident ink outlines, graphic shadows, dynamic contrast, halftone textures,
controlled color blocks, and cinematic comic-book lighting.

Preserve the identity, pose, and major composition of the original subject,
but render every element as hand-drawn comic art.

The final image should look like a professionally illustrated graphic novel panel,
not a photograph with a comic filter.

No real-world photo textures, no 3D rendering, no anime or manga style.
`,
        negative_prompt: `
Japanese anime,
manga,
chibi,
children's cartoon,
cute style,
3D animation,
photorealistic,
watercolor,
oil painting,
overly exaggerated anatomy,
distorted face,
extra fingers,
duplicate characters,
random text,
speech bubbles,
low quality,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo,
photo background
`
    },
    'oil-painting': {
        name: '油画',
        name_en: 'Oil Painting',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into a sophisticated oil painting.

Repaint the entire image with visible painterly brushwork, layered pigments,
subtle impasto, natural color transitions, and rich canvas texture.

The result should look physically painted with oil paint on canvas,
not a photograph with an oil-paint filter and not a digital collage.

Maintain the recognizable face, pose, and overall composition of the original subject,
but every detail must be rendered in oil painting style.

Use a restrained, museum-quality palette with nuanced shadows and highlights.

The final result should feel like a professionally painted portrait or figurative oil painting.
`,
        negative_prompt: `
digital filter,
photographic,
anime,
cartoon,
vector,
3D render,
plastic skin,
over-smoothed face,
excessive saturation,
abstract distortion,
changed identity,
deformed anatomy,
blurry,
low quality,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo,
photo background
`
    },
    'watercolor': {
        name: '水彩',
        name_en: 'Watercolor',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into a refined watercolor painting.

Repaint the whole image using transparent watercolor layers, natural pigment diffusion,
soft edges, subtle paper grain, controlled washes, and elegant white space.

Allow some areas to dissolve naturally into the paper while keeping the main subject recognizable.

The image should feel hand-painted with real watercolor pigments on textured paper,
not a digital filter and not a mixed-media collage.

Preserve the original person's identity, pose, and composition,
but render all elements in a delicate watercolor style.

Overall feeling:
quiet, airy, artistic, natural, and refined.
`,
        negative_prompt: `
digital painting,
3D,
anime,
cartoon,
photorealistic,
plastic texture,
hard vector edges,
neon colors,
oversaturation,
heavy outlines,
changed identity,
deformed face,
blurry,
low quality,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo,
photo background
`
    },
    'analog-film': {
        name: '胶片摄影',
        name_en: 'Analog Film',
        model: 'qwen-image-edit-max',
        positive_prompt: `
Transform the uploaded photograph into a high-end analog film photograph.

Process the entire image to simulate professional 35mm film photography:
natural film grain, subtle halation, gentle highlight roll-off,
organic contrast, slightly muted colors, nuanced shadows, and realistic analog texture.

The final image should look photographed on real film,
not a digital snapshot with a filter, and not a mixed-media composition.

Keep the original subject, pose, and environment,
but the overall rendering should be fully analog film in character.

Aim for the atmosphere of a carefully scanned professional film photograph,
with restrained color grading and cinematic depth.
`,
        negative_prompt: `
digital HDR,
oversharpening,
excessive clarity,
heavy Instagram filter,
extreme color grading,
neon colors,
artificial skin,
plastic skin,
anime,
cartoon,
illustration,
3D render,
changed identity,
deformed face,
low quality,
blurry,
collage,
split screen,
side-by-side,
original photograph visible,
unaltered photo
`
    }
};

function getStyleList() {
    return Object.entries(STYLE_CONFIGS).map(([id, config]) => ({
        id,
        name: config.name,
        name_en: config.name_en
    }));
}

module.exports = async (req, res) => {
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
            error: 'API 密钥未配置，请设置环境变量 DASHSCOPE_API_KEY'
        });
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            endpoint: 'PixShift AI Photo Style Transfer API',
            method: 'POST',
            description: '上传照片并选择视觉风格，通过 AI 生成风格化图片',
            availableStyles: getStyleList(),
            parameters: {
                style_id: 'string (required) - 风格 ID',
                image_base64: 'string (required) - base64 编码的图片数据'
            }
        });
    }

    if (req.method === 'POST') {
        try {
            const { style_id, image_base64 } = req.body;

            if (!style_id || !image_base64) {
                return res.status(400).json({
                    success: false,
                    error: '缺少必要参数: style_id 和 image_base64'
                });
            }

            if (!STYLE_CONFIGS[style_id]) {
                return res.status(400).json({
                    success: false,
                    error: `不支持的风格: ${style_id}`,
                    available_styles: getStyleList()
                });
            }

            const styleConfig = STYLE_CONFIGS[style_id];

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

            const response = await fetch(
                `${BASE_URL}/services/aigc/multimodal-generation/generation`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal: AbortSignal.timeout(60000)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || `DashScope API error: ${response.status}`);
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
                throw new Error('未找到生成的图片 URL');
            }

            return res.status(200).json({
                success: true,
                imageUrl,
                style_id,
                style_name: styleConfig.name,
                style_name_en: styleConfig.name_en,
                request_id: data.request_id
            });
        } catch (error) {
            console.error('PixShift API Error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message || '图像处理失败'
            });
        }
    }

    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
};
