# Framed Italian artwork

The light product interface uses three public-domain Canaletto paintings from The Metropolitan Museum of Art. These are eighteenth-century Venetian vedute, not Renaissance works and not photographs of the universities in the catalogue. The works are decorative; they do not imply a particular institution or application result.

Original museum image URLs, collection pages, dates checked, and SHA-256 checksums are recorded in `public/art/sources.json`. The Met collection pages identify all three images as Public Domain under Open Access. Images are served locally and do not require a museum API at runtime.

`FramedArtwork` provides landscape, portrait, circular vignette and small rectangular formats. Each uses a deliberate geometric crop and a thin warm border. No image is blurred into the page. The museum originals of the canal and lagoon include photographic support edges; an inner overflow mask and a fixed base scale hide these edges. Hover increases that presentation scale by 3%, and respects reduced motion. Original JPEG pixels are preserved.

Shared colour treatment is `sepia(.08) contrast(.98)`. No generative image editing, repainting or synthetic university photography was used.

Legacy `EditorialArtwork`, `CampusArtwork`, `PricesLandscape`, `UniversityArtwork` and `PortalArtwork` wrappers use these framed reproductions. Decorative watercolor background layers (`BotanicalCanvas`, `StudyAtmosphere`, `TomatoAccent`) render nothing. Historical illustration files remain for repository history, but the wrappers no longer mount them.
