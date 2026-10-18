import { Painting } from "@/components/gallery/GalleryPrimitives";
export function UniversityArtwork({variant}:{variant:"balcony"|"paperwork"}) { return variant==="balcony"?<div className="gallery-vignette gallery-university-art" aria-hidden="true"><Painting scene="square"/></div>:null; }
