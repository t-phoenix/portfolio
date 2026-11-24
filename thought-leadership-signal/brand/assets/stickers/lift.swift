import Vision
import CoreImage
import AppKit
// usage: lift2 image outdir name:cx:cy:hw:hh ...   (coords on a 1000-wide preview)
let a = CommandLine.arguments
let full = CIImage(contentsOf: URL(fileURLWithPath: a[1]), options: [.applyOrientationProperty: true])!
let W = full.extent.width, H = full.extent.height, k = W / 1000
let ctx = CIContext()
for spec in a[3...] {
  let p = spec.split(separator: ":"); let name = String(p[0])
  let cx = Double(p[1])! * k, cy = Double(p[2])! * k, hw = Double(p[3])! * k, hh = Double(p[4])! * k
  // CI origin is bottom-left
  let rect = CGRect(x: cx - hw, y: H - cy - hh, width: 2 * hw, height: 2 * hh).intersection(full.extent)
  let crop = full.cropped(to: rect).transformed(by: CGAffineTransform(translationX: -rect.minX, y: -rect.minY))
  let h = VNImageRequestHandler(ciImage: crop)
  let req = VNGenerateForegroundInstanceMaskRequest()
  do { try h.perform([req]) } catch { print(name, "fail"); continue }
  guard let r = req.results?.first else { print(name, "none"); continue }
  // pick the instance under the crop centre
  let m = r.instanceMask; CVPixelBufferLockBaseAddress(m, .readOnly)
  let mw = CVPixelBufferGetWidth(m), mh = CVPixelBufferGetHeight(m), rb = CVPixelBufferGetBytesPerRow(m)
  let base = CVPixelBufferGetBaseAddress(m)!.assumingMemoryBound(to: UInt8.self)
  var idx = Int(base[(mh / 2) * rb + mw / 2])
  CVPixelBufferUnlockBaseAddress(m, .readOnly)
  if idx == 0 { idx = r.allInstances.first ?? 0 }
  if idx == 0 { print(name, "empty"); continue }
  let buf = try! r.generateMaskedImage(ofInstances: IndexSet(integer: idx), from: h, croppedToInstancesExtent: true)
  try! ctx.writePNGRepresentation(of: CIImage(cvPixelBuffer: buf), to: URL(fileURLWithPath: "\(a[2])/\(name).png"), format: CIFormat.RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  print(name, "ok", r.allInstances.count)
}
