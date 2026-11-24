# Sticker packs

Die cut PNGs (transparent) lifted from our own photos with Apple Vision, on device, no paid model.
Use them as slap stickers on creatives: 1 to 3 per frame, rotated, with a white die cut edge and a soft shadow.

## Make a new pack
```bash
swiftc -O lift.swift -o /tmp/lift
# coords are on a 1000 px wide preview of the photo: name:centreX:centreY:halfW:halfH
/tmp/lift photo.HEIC out/ chai:447:343:56:46 tiger:330:455:60:52
```
The tool keeps the object under the crop centre, so give each sticker a tight box.

## Packs
- `mumbai-2026/` stickers from the IBW, ETHGlobal Mumbai, Pragma, Devcon week (IMG_4189)
- `mumbai-2026/objects/` badges, ENS spinners, fan, shirts, sticker bag (IMG_4190 to IMG_4196)

## Ideas for future packs
- Reaction pack: cutouts of your own face doing 4 expressions (shock, smug, dead inside, ser) for shitposts
- Receipts pack: lifted tickets, boarding passes, conference wristbands
- Builder pack: laptop sticker wall, terminal prompt, coffee cup, x402 handwritten note
