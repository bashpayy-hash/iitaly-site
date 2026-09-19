import { socialImage, SOCIAL_IMAGE_SIZE } from "@/lib/socialImage";

export const alt = "IITALY — поступление в Италию по понятному плану";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return socialImage();
}
