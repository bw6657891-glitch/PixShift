// dunhuang-render.js
// PixShift — AI Photo Style Transfer API
// 使用 Node.js 内置 fetch，无需额外安装依赖

const API_KEY = process.env.DASHSCOPE_API_KEY;

const BASE_URL =
    'https://dashscope.aliyuncs.com/api/v1';


// ======================================================
// PixShift Style Configurations
// ======================================================

const STYLE_CONFIGS = {

    // --------------------------------------------------
    // 1. 极简抽象 / Photo Abstract Editorial
    // --------------------------------------------------

    'photo-abstract-editorial': {

        name: '极简抽象',

        name_en: 'Photo Abstract Editorial',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Preserve the original photograph faithfully as the primary visual source.
Do not redraw, replace, trace, vectorize, or turn the photograph into a generic illustration.

Create a refined editorial photography composition inspired by contemporary
photography books and art magazines.

Keep the original photograph visually recognizable and natural.
Below or around the original photograph, introduce a lower warm ivory abstract
memory panel derived ONLY from the spatial relationships, dominant colors,
visual rhythm, silhouettes, negative space, and structural geometry found in
the original photograph.

The abstract panel should feel like a visual memory extracted from the photo,
not a thumbnail, infographic, illustration, or decorative collage.

Use restrained asymmetry, generous whitespace, subtle geometric shapes,
organic fragments, quiet visual rhythm, and sophisticated editorial balance.

All colors used in the abstract panel must be derived from the original photo.

Add exactly one small restrained English title containing 2 to 5 words.
The typography should be subtle and editorial.

Overall feeling:
minimalist, sophisticated, quiet, contemporary, photographic,
high-end editorial design, museum catalogue, photography book.

Do not change the identity or main subject of the original photograph.
Do not introduce unrelated objects.
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
deformed anatomy
`
    },


    // --------------------------------------------------
    // 2. 中国古画 / Classical Painting
    // --------------------------------------------------

    'classical-painting': {

        name: '中国古画',

        name_en: 'Chinese Classical Painting',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Transform the uploaded photograph into an elegant Chinese classical painting.

Preserve the recognizable identity, facial characteristics, pose and main
composition of the original subject.

Use the visual language of traditional Chinese painting:
ink wash, mineral pigments, rice paper texture, elegant brushwork,
controlled outlines, atmospheric empty space and poetic composition.

The transformation should feel like a genuine traditional artwork rather than
a modern digital filter.

For portraits, preserve the person's recognizable face while adapting clothing,
texture, background and rendering into the visual language of Chinese classical
painting.

Use restrained traditional colors such as ink black, warm paper, muted mineral
green, ochre, muted red and subtle blue.

Sophisticated, historical, quiet and artistic.
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
blurry
`
    },


    // --------------------------------------------------
    // 3. 美式漫画 / American Comic
    // --------------------------------------------------

    'american-comic': {

        name: '美式漫画',

        name_en: 'American Comic',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Transform the photograph into a sophisticated American comic-book illustration.

Preserve the identity, pose, facial expression, clothing silhouette and major
composition of the original photograph.

Use confident ink outlines, graphic shadows, dynamic contrast, halftone
textures, controlled color blocks and cinematic comic-book lighting.

The result should resemble a professionally illustrated modern American comic,
not a children's cartoon.

Preserve recognizable facial features and anatomy.

Use strong visual hierarchy and graphic composition while keeping the original
scene recognizable.

The final image should feel like a premium graphic novel panel.
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
low quality
`
    },


    // --------------------------------------------------
    // 4. 油画 / Oil Painting
    // --------------------------------------------------

    'oil-painting': {

        name: '油画',

        name_en: 'Oil Painting',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Transform the uploaded photograph into a sophisticated oil painting.

Preserve the original person's identity, pose, facial structure and overall
composition.

Use visible painterly brushwork, layered pigments, subtle impasto,
natural color transitions and rich surface texture.

The image should look physically painted with oil paint on canvas rather than
having a simple digital oil-painting filter.

Maintain realistic proportions and recognizable facial features.

Use a restrained, museum-quality palette with nuanced shadows and highlights.

The final result should feel like a professionally painted portrait or
figurative oil painting.
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
low quality
`
    },


    // --------------------------------------------------
    // 5. 水彩 / Watercolor
    // --------------------------------------------------

    'watercolor': {

        name: '水彩',

        name_en: 'Watercolor',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Transform the photograph into a refined watercolor painting.

Preserve the original person's identity, pose, composition and major visual
features.

Use transparent watercolor layers, natural pigment diffusion, soft edges,
subtle paper grain, controlled washes and elegant white-space.

Allow some areas to dissolve naturally into the paper while keeping the main
subject recognizable.

The image should feel hand-painted with real watercolor pigments on textured
paper.

Use delicate, sophisticated colors and avoid excessive digital smoothness.

Overall feeling:
quiet, airy, artistic, natural and refined.
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
low quality
`
    },


    // --------------------------------------------------
    // 6. 胶片摄影 / Analog Film
    // --------------------------------------------------

    'analog-film': {

        name: '胶片摄影',

        name_en: 'Analog Film',

        model: 'qwen-image-edit-max',

        positive_prompt: `
Transform the uploaded photograph into a high-end analog film photograph.

Preserve the original person's identity, pose, composition and environment.

Introduce authentic photographic characteristics associated with professional
35mm film photography:
natural film grain, subtle halation, gentle highlight roll-off,
organic contrast, slightly muted colors, nuanced shadows and realistic
analog texture.

The image should feel photographed on real film rather than processed with
an obvious digital filter.

Keep skin tones natural and preserve important details.

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
blurry
`
    }

};


// ======================================================
// Helper
// ======================================================

function getStyleList() {

    return Object.entries(STYLE_CONFIGS).map(
        ([id, config]) => ({
            id,
            name: config.name,
            name_en: config.name_en
        })
    );

}


// ======================================================
// API Handler
// ======================================================

module.exports = async (req, res) => {

    // --------------------------------------------------
    // CORS
    // --------------------------------------------------

    res.setHeader(
        'Content-Type',
        'application/json'
    );

    res.setHeader(
        'Access-Control-Allow-Origin',
        '*'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );


    if (req.method === 'OPTIONS') {

        return res.status(200).end();

    }


    // --------------------------------------------------
    // API Key
    // --------------------------------------------------

    if (!API_KEY) {

        return res.status(500).json({

            success: false,

            error:
                'API 密钥未配置，请设置环境变量 DASHSCOPE_API_KEY'

        });

    }


    // --------------------------------------------------
    // GET
    // --------------------------------------------------

    if (req.method === 'GET') {

        return res.status(200).json({

            success: true,

            endpoint:
                'PixShift AI Photo Style Transfer API',

            method: 'POST',

            description:
                'Upload a photo and transform it into a selected visual style.',

            availableStyles:
                getStyleList(),

            parameters: {

                style_id:
                    'string (required) - PixShift style ID',

                image_base64:
                    'string (required) - base64 encoded image'

            }

        });

    }


    // --------------------------------------------------
    // POST
    // --------------------------------------------------

    if (req.method === 'POST') {

        try {

            const {
                style_id,
                image_base64
            } = req.body;


            // --------------------------------------------------
            // Validation
            // --------------------------------------------------

            if (!style_id || !image_base64) {

                return res.status(400).json({

                    success: false,

                    error:
                        '缺少必要参数: style_id 和 image_base64'

                });

            }


            if (!STYLE_CONFIGS[style_id]) {

                return res.status(400).json({

                    success: false,

                    error:
                        `不支持的风格: ${style_id}`,

                    available_styles:
                        getStyleList()

                });

            }


            const styleConfig =
                STYLE_CONFIGS[style_id];


            // --------------------------------------------------
            // Normalize image
            // --------------------------------------------------

            let imageData =
                image_base64;


            if (
                !image_base64.startsWith(
                    'data:image/'
                )
            ) {

                imageData =
                    `data:image/jpeg;base64,${image_base64}`;

            }


            // --------------------------------------------------
            // DashScope request
            // --------------------------------------------------

            const requestBody = {

                model:
                    styleConfig.model,

                input: {

                    messages: [

                        {

                            role: 'user',

                            content: [

                                {
                                    image:
                                        imageData
                                },

                                {
                                    text:
                                        styleConfig.positive_prompt
                                }

                            ]

                        }

                    ]

                },

                parameters: {

                    n: 1,

                    negative_prompt:
                        styleConfig.negative_prompt,

                    size:
                        '1024*1024',

                    prompt_extend:
                        true,

                    watermark:
                        false

                }

            };


            const response = await fetch(

                `${BASE_URL}/services/aigc/multimodal-generation/generation`,

                {

                    method: 'POST',

                    headers: {

                        'Authorization':
                            `Bearer ${API_KEY}`,

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        ),

                    signal:
                        AbortSignal.timeout(
                            60000
                        )

                }

            );


            const data =
                await response.json();


            // --------------------------------------------------
            // API error
            // --------------------------------------------------

            if (!response.ok) {

                throw new Error(

                    data.message ||
                    data.error ||
                    `DashScope API error: ${response.status}`

                );

            }


            // --------------------------------------------------
            // Extract generated image
            // --------------------------------------------------

            const content =
                data?.output?.choices?.[0]?.message?.content;


            let imageUrl =
                null;


            if (Array.isArray(content)) {

                for (const item of content) {

                    if (item.image) {

                        imageUrl =
                            typeof item.image === 'string'
                                ? item.image
                                : item.image.url;

                        break;

                    }

                }

            }


            if (!imageUrl) {

                throw new Error(
                    '未找到生成的图片 URL'
                );

            }


            // --------------------------------------------------
            // Success
            // --------------------------------------------------

            return res.status(200).json({

                success: true,

                imageUrl,

                style_id,

                style_name:
                    styleConfig.name,

                style_name_en:
                    styleConfig.name_en,

                request_id:
                    data.request_id

            });


        } catch (error) {

            console.error(
                'PixShift API Error:',
                error.message
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    '图像处理失败'

            });

        }

    }


    // --------------------------------------------------
    // Method not allowed
    // --------------------------------------------------

    return res.status(405).json({

        success: false,

        error:
            'Method not allowed'

    });

};