#!/usr/bin/env bash
# Owner, 3 Nov 2026: «установи эти плагины, используй их всех при надобности в
# девелопменте». Cloud sessions start from a fresh container, so this
# SessionStart hook reinstalls the design and development skills globally.
# It runs in the background (the session does not wait) and skips sources
# whose skills are already present. Log: /tmp/iitaly-skills-install.log
set -u
log=/tmp/iitaly-skills-install.log
(
  install() { # $1 = source, $2 = skill selector, $3 = a skill name that proves it is installed
    if [ -d "$HOME/.claude/skills/$3" ]; then echo "skip $1"; return; fi
    timeout 600 npx -y skills add "$1" -g -y -a claude-code -s "$2" || echo "failed $1"
  }
  install nutlope/hallmark '*' hallmark
  install dominikmartn/hue '*' hue
  install dammyjay93/interface-design '*' interface-design
  install zanwei/design-dna '*' design-dna
  install lottiefiles/motion-design-skill '*' motion-design
  install anthropics/skills frontend-design frontend-design
  install nateherkai/scroll-craft '*' scroll-craft
  install nextlevelbuilder/ui-ux-pro-max-skill '*' ui-ux-pro-max
  install addyosmani/agent-skills '*' spec-driven-development
  # Owner, 5 Nov («ещё используй эти плагины для дизайна»): Emil Kowalski's
  # animation and design-engineering skills (animate, review-animations,
  # improve-animations, choreograph, apple-design, mobile-native, break-ui…)
  # and the three.js r186 skills. lottiefiles/motion-design-skill is above.
  install emilkowalski/skills '*' animate
  install CloudAI-X/threejs-skills '*' threejs-fundamentals
  # Owner, 4 Nov: «добавь скил impeccable». Its own installer downloads a
  # bundle from impeccable.style, which the cloud proxy refuses, so the built
  # skill and its subagents are copied from the GitHub repository instead.
  if [ -d "$HOME/.claude/skills/impeccable" ]; then echo "skip impeccable"; else
    src=$(mktemp -d) && timeout 300 git clone -q --depth 1 https://github.com/pbakaus/impeccable "$src/impeccable" \
      && cp -R "$src/impeccable/plugin/skills/impeccable" "$HOME/.claude/skills/impeccable" \
      && mkdir -p "$HOME/.claude/agents" && cp "$src/impeccable/plugin/agents/"*.md "$HOME/.claude/agents/" \
      || echo "failed impeccable"
    rm -rf "$src"
  fi
  # Owner, 21 Nov 2026, with a reel's «Marketing» list (remotion,
  # marketingskills, humanizer, social-media-skills): «для инсты установи
  # полезные скиллы», and 22 Nov: «Marketing Skill, Social Media Skills,
  # Humanizer тоже устанавливай». Only what serves Instagram, not the whole
  # packs (53 and 17 skills, mostly B2B and LinkedIn): posts, carousels, reels
  # scripts, hooks, a content plan, a voice profile, captions without AI tells.
  # Owner, 22 Nov, with a reel's «Design» list: «влей тогда Taste Skill,
  # Hyperframes, GSAP». GSAP's own skills without the Vue/Svelte one;
  # hyperframes' core, CLI and registry (video from HTML: for when a reel is
  # built in code; its media and porting skills carry 95 scripts and wait for
  # that day). The hyperframes skill asks to send a usage beacon when it
  # starts: opt out of its telemetry before the first command.
  # Each repository is pinned to the commit that was read before it was added,
  # so a later change upstream does not reach the session unread. Nothing
  # here runs by itself: scripts inside a skill are read before they are run.
  # Remotion is not here (owner: «наверное, потом… когда будем видео делать»):
  # remotion-dev/skills is added the day a video is built with it.
  pinned() { # $1 = repository, $2 = commit, then folders inside it ("." = the root, named after $1)
    repo=$1; sha=$2; shift 2
    need=0; for skill in "$@"; do name=${skill##*/}; [ "$skill" = "." ] && name=${repo##*/}; [ -d "$HOME/.claude/skills/$name" ] || need=1; done
    if [ "$need" = 0 ]; then echo "skip $repo"; return; fi
    src=$(mktemp -d)
    # Only the named folders of that one commit are fetched: hyperframes is 340 MB as a whole.
    if git init -q "$src/repo" && git -C "$src/repo" remote add origin "https://github.com/$repo" \
      && { [ "$1" = "." ] || git -C "$src/repo" sparse-checkout set --no-cone "$@"; } \
      && timeout 300 git -C "$src/repo" fetch -q --depth 1 --filter=blob:none origin "$sha" && git -C "$src/repo" checkout -q FETCH_HEAD; then
      mkdir -p "$HOME/.claude/skills"
      for skill in "$@"; do
        name=${skill##*/}; [ "$skill" = "." ] && name=${repo##*/}
        [ -d "$HOME/.claude/skills/$name" ] && continue
        if [ "$skill" = "." ]; then mkdir "$HOME/.claude/skills/$name" && cp "$src/repo/SKILL.md" "$src/repo/LICENSE" "$HOME/.claude/skills/$name/" || echo "failed $repo"
        else cp -R "$src/repo/$skill" "$HOME/.claude/skills/$name" || echo "failed $repo $skill"; fi
      done
    else echo "failed $repo"; fi
    rm -rf "$src"
  }
  pinned coreyhaines31/marketingskills 5b2b400eec1e7e1cec76245a715d0b0d4fd2a9c1 \
    skills/social skills/video skills/image skills/content-strategy skills/ad-creative \
    skills/influencer-marketing skills/copywriting skills/copy-editing skills/marketing-psychology skills/product-marketing
  pinned charlie947/social-media-skills 10ca79c0ec0be0f7654d19cd4f0c86b6fa6ed23b \
    skills/reels-scripting skills/hook-generator skills/content-matrix skills/voice-builder skills/gemini-carousel
  pinned blader/humanizer a32f24407364c74c812b43c15926d638bee1e072 .
  pinned greensock/gsap-skills aed9cfd3277740755f6bfc1155c7aa645403b760 \
    skills/gsap-core skills/gsap-react skills/gsap-timeline skills/gsap-scrolltrigger skills/gsap-performance skills/gsap-plugins skills/gsap-utils
  pinned heygen-com/hyperframes f03233ab4d1efcaaa677fd82fcad3a96bb46f9ac \
    skills/hyperframes skills/hyperframes-cli skills/hyperframes-registry
  # taste-skill: its instructions, references and scripts, without the 38 MB kit
  # of effects, photographs and icons (this site has its own world), and
  # without the Stop hook its SKILL.md declares: that hook would run the
  # skill's gate.mjs at the end of every turn. Its rules are a lens for
  # review; DESIGN.md decides what this site looks like.
  if [ -d "$HOME/.claude/skills/design-taste-frontend" ]; then echo "skip taste-skill"; else
    src=$(mktemp -d); kit=skills/taste-skill
    if git init -q "$src/repo" && git -C "$src/repo" remote add origin https://github.com/Leonxlnx/taste-skill \
      && git -C "$src/repo" sparse-checkout set --no-cone "$kit/SKILL.md" "$kit/references" "$kit/scripts" LICENSE \
      && timeout 300 git -C "$src/repo" fetch -q --depth 1 --filter=blob:none origin f6b76575f949707b4e3c37cd86cb44b0b98643e8 && git -C "$src/repo" checkout -q FETCH_HEAD; then
      dest="$HOME/.claude/skills/design-taste-frontend"
      mkdir -p "$dest" && cp -R "$src/repo/$kit/references" "$src/repo/$kit/scripts" "$src/repo/LICENSE" "$dest/" \
        && awk 'NR==1{print;fm=1;next} fm&&/^---/{fm=0;skip=0;print;next} fm&&/^hooks:/{skip=1;next} fm&&skip&&/^[^[:space:]]/{skip=0} !skip{print}' "$src/repo/$kit/SKILL.md" > "$dest/SKILL.md" \
        || echo "failed taste-skill"
    else echo "failed taste-skill"; fi
    rm -rf "$src"
  fi
  echo done
) > "$log" 2>&1 &
exit 0
