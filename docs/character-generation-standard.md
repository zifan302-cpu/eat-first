# 冰箱小鲜队角色生成标准 V1

> 本文是当前唯一角色图片生成标准。旧的 2.5D、道具化角色提示词与资产已经移除，避免后续生成再次混入旧风格。

## 固定参考图

每次生成都必须同时提供以下两张图片，并保持顺序不变：

1. `assets/character-system/fresh-squad-family-style-reference.png`
   - 角色家族风格参考。
   - 只提取端正站姿、脸部尺度、短肢体、二维毡纸材质、色彩克制和系列一致性。
   - 不复制图中任何一种食材的具体轮廓。
2. `assets/character-system/tomato-freshness-state-reference.png`
   - 四阶段鲜度变化参考。
   - 只提取状态递进幅度、构图顺序和“逐渐没精神但不痛苦”的表达。
   - 不把番茄叶冠、红色或番茄果形带到其他食材上。

仅重复文字提示词不能保证稳定复现。两张参考图、同一模型版本、相同比例和下方锁定提示词必须一起使用。

## 当前产品资产

- 五角色生产稿：`assets/character-system/upright-fresh-production-sheet.png`
- 去背景生产稿：`assets/character-system/upright-fresh-production-sheet-alpha.png`
- 透明单角色：`public/art/upright-characters/`
- 裁切与图标处理脚本：`scripts/prepare-upright-characters.py`

当前产品只使用已经验收的番茄、胡萝卜、西兰花、茄子和蘑菇。其他食材在建立正式母版前，不使用某个已有角色代替其食材身份。

## 日常使用方法

1. 上传或引用上述两张参考图。
2. 复制“四阶段单变量母提示词”。
3. 只替换 `{FOOD_NAME}`，例如 `lemon`、`broccoli`、`tofu` 或 `milk carton`。
4. 不增加“更可爱”“更精致”“像某品牌”等临时风格词。
5. 每种食材单独生成一次，不在一次调用中要求多种食材。
6. 如果平台支持固定 seed，可为整套角色固定同一 seed；不支持时不要把 seed 当作必要条件。

## 不可变化的家族规则

- 食材本体就是完整身体，不添加独立大头。
- 母版接近正面、端正站立、低重心；变化主要来自精气神下降。
- 两只小而靠近的深墨绿种子形眼睛，一条短而略偏心的嘴。
- 无鼻子、眉毛、腮红、牙齿、眼睛高光或表情包符号。
- 手臂短、低位、略收窄；手是单一圆钝形，不画手指或手套结构。
- 腿很短，脚为低矮圆钝块，不像鞋或靴子。
- 二维软边剪纸色块，叠加极轻的毡纸短纤维；几乎无明暗塑形。
- 每个角色只放大一种真实的天然食材结构作为识别点。
- 单角色最多三种食材色，加统一深墨绿五官与暖蛋壳白背景。
- 不使用服装、职业道具、徽章或随机装饰制造个性。

## 四阶段单变量母提示词

除 `{FOOD_NAME}` 外，不修改任何文字。

```text
Use case: stylized-concept
Asset type: canonical four-state freshness character sheet for the original “Fridge Fresh Squad” visual system.

Input images:
Image 1 is the mandatory family-style constitution. Preserve its quiet upright stance, tiny seed-shaped face, short weighted limbs, matte two-dimensional soft-edged felt-paper construction, restrained adult-friendly cuteness, simple silhouette logic, and generous warm negative space. Do not copy the anatomy of any specific food shown in Image 1.
Image 2 is the mandatory freshness-progression constitution. Preserve its left-to-right four-stage structure, tightly controlled loss of energy, consistent identity across states, and non-disgusting treatment. Do not copy tomato-specific leaves, color, or body anatomy from Image 2.

Primary request:
Create exactly four full-body states of one original {FOOD_NAME} character, arranged from left to right: fresh, eat soon, rescue today, check and handle. The food name is the only creative variable. Infer the ingredient’s authentic dominant silhouette, restrained natural colors, most recognizable natural structural feature, and one gentle real-world softening cue. Simplify those facts into the fixed Fridge Fresh Squad family system. Do not invent clothes, tools, symbols, or decorative features.

Identity lock:
All four figures are the same named character at the same visual scale. Lock the basic body silhouette, face position, eye spacing, limb thickness, natural feature count, material treatment, and overall proportions. State changes must never create four different character designs. The ingredient must remain instantly recognizable at thumbnail size from its outer silhouette, without labels or props.

Base construction:
The {FOOD_NAME} itself forms the complete body, with no separate oversized head. Use one broad, compact, low-centred main mass derived from the food’s real structure. Place two short sturdy legs directly beneath it, ending in low rounded feet that are part of the character, not shoes. Place two compact low-set tapered arms beside it, ending in one-piece rounded shapes without fingers, palms, cuffs, or glove anatomy. The character stands nearly front-facing.

Face system:
Use exactly two tiny vertically compressed deep-ink-green seed-shaped eyes, fairly close together, placed consistently in the lower half of the food body. Add one very short, slightly off-centre mouth. No nose, eyebrows, cheeks, teeth, tongue, pupils, eye highlights, or large emotional features. The expression is calm, attentive, faintly amused, and never babyish.

Natural identity feature:
Select exactly one authentic structural feature of {FOOD_NAME} as its main memory point, such as a leaf cluster, cap edge, floret crown, peel fold, cut corner, stem, pod curve, carton top, or block indentation. Keep it simple and integrated into the food body. In the fresh state, let one part of this natural feature lean subtly forward-right as the shared family rhythm. Never turn it into a literal arrow, check mark, hairstyle, hat, or accessory.

State 1 — Fresh:
Upright balanced stance, feet slightly apart, arms relaxed with a small gap from the body. Natural identity feature looks lifted and elastic. Eyes use their standard tiny height. Mouth is a restrained shallow curve. Full standard ingredient color. Body silhouette looks stable and full.

State 2 — Eat soon:
Preserve the exact same identity and scale. Tilt the whole body about 2 degrees, move one foot slightly inward, and bring the arms slightly closer to the body. Lower or soften the natural identity feature by about 8 degrees. Make one eye approximately 10 percent shorter than the other. Change the mouth to a tiny nearly flat off-centre line. Reduce saturation about 5 percent. Add no surface damage.

State 3 — Rescue today:
Preserve identity. Compress the main body vertically by no more than 4 percent while keeping its characteristic width and silhouette. Narrow the stance and bring both arms close to the sides. Lower or soften the natural identity feature by about 15 degrees. Make both eyes approximately 25 percent shorter than in State 1. Use a tiny slightly slanted closed mouth. Add exactly one gentle ingredient-appropriate softening cue, such as one shallow indentation, one slightly relaxed edge, one subtly looser cluster, or one mild bend. The cue must remain graphic, clean, and non-realistic. Reduce saturation about 10 percent.

State 4 — Check and handle:
Preserve the same identity, face placement, and overall mass. Lower the centre of gravity into a very low seated or resting posture with feet still visible. Keep arms close to the body. Lower or soften the natural identity feature by about 20 degrees, without making it dead, brown, broken, or detached. Use calm half-closed seed eyes and a tiny neutral off-centre dash mouth. Make the same single softening cue slightly more visible, but add no second damage cue. Reduce saturation no more than 15 percent. The character feels low-energy and in need of attention, not ill, frightened, ashamed, dying, or disgusting.

Style and medium:
Original two-dimensional editorial animation character made from simple soft-edged cut-paper color masses with only a whisper of short felt-fibre texture. Matte, quiet, tactile, and almost flat. Use at most one narrow flat darker color shape per state. No volumetric rendering, no continuous rounded shading, no realistic surface detail, and no visible sewing construction.

Composition:
Horizontal 16:9 or 2:1 sheet on a plain warm eggshell background. Four states evenly spaced on one baseline, identical visual scale, all full-body and fully visible, with generous negative space. The progression must read from posture and silhouette alone. No labels, captions, numbers, arrows, dividers, UI, logo, frame, decorative background, or watermark.

Color system:
Derive no more than three restrained matte colors from the authentic colors of {FOOD_NAME}. Use the same deep ink green for all faces and limbs and the same warm eggshell background as the references. Later states may lose small amounts of saturation but must not become gray, corpse-like, neon, muddy, or dramatically recolored.

Consistency priority:
When requirements compete, prioritize in this order: same-character identity across four states; family resemblance to Image 1; freshness progression from Image 2; thumbnail silhouette recognition; restrained adult-friendly cuteness; food-specific detail. Do not add detail to solve a silhouette problem.

Avoid:
imitation of any existing plush, animation, game, or food-brand IP; generic kawaii sticker; emoji face; giant shiny eyes; blush; baby anatomy; human hands; fingers; gloves; shoes; boots; costume; badge; tool; prop; realistic food photography; plush-toy product photography; glossy 3D clay; vinyl; plastic; fur-covered food; visible seams; stuffing bulges; complex shadows; gradients; cinematic lighting; waving; running; jumping; dramatic acting; sick emoji; sweat; tears; X eyes; spiral eyes; vomiting; stomach-holding; flies; odor lines; mold; rot; black spots; leaking liquid; guilt-inducing suffering; extra characters; other foods; text; logo; watermark.

Output intent:
A reusable system-consistent four-state design sheet for one {FOOD_NAME} character, matching the fixed Fridge Fresh Squad family grammar and freshness-state language while deriving its identity only from the food’s authentic natural structure.
```

## 单独导出某个状态

不要重新从文字生成单张角色，否则角色身份容易漂移。正确流程是：

1. 先用母提示词生成并确认该食材的四阶段设定稿。
2. 将确认后的设定稿作为第三张参考图。
3. 通过编辑或裁切提取指定状态，明确要求保持该状态的轮廓、五官、颜色和材质不变。
4. 需要动作时，从“新鲜”状态派生；需要提醒时，从“快吃”或“今日拯救”状态派生。

推荐编辑指令：

```text
Image 3 is the approved identity reference for this exact food character. Extract and redraw only the requested state as one full-body character. Preserve its silhouette, face placement, limb construction, natural identity feature, palette, and felt-paper texture exactly. Change only the pose or framing explicitly requested. Do not redesign the character and do not borrow anatomy from Images 1 or 2.
```

## 生成后验收

以下任一项失败，就不进入产品：

- 四个状态看起来不是同一个角色。
- 去掉五官后无法从轮廓认出食材。
- 不新鲜主要依靠哭脸、病态符号或腐败细节表达。
- 手像手套、脚像鞋、肢体像人类。
- 角色出现服装、道具或与食材无关的装饰。
- 画面变成 3D 毛绒、黏土、塑料或真实食物。
- 与固定参考图并排时，脸部尺度、站姿或材质明显来自另一套项目。
