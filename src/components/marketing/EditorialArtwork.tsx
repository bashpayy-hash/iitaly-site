import { Painting } from "@/components/gallery/GalleryPrimitives";
export function EditorialArtwork({className="",priority=false}:{scene:"terrace"|"balcony-scene"|"study-desk";priority?:boolean;className?:string}) { return <Painting className={className} eager={priority}/>; }
export function StudyAtmosphere(){return null;}
export function TomatoAccent(){return null;}
export function LemonPostcard(){return null;}
