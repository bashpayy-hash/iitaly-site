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
  # полезные скиллы». Only what serves Instagram, not the whole packs (53 and
  # 17 skills, mostly B2B and LinkedIn): posts, carousels, reels scripts,
  # hooks, a content plan, a voice profile, captions without AI tells.
  # Each repository is pinned to the commit that was read before it was added
  # (MIT, instructions and reference files only), so a later change upstream
  # does not reach the session unread. Remotion is not here: it is a video
  # toolchain of its own, to be set up when a reel is built in code.
  pinned() { # $1 = repository, $2 = commit, then folders inside it ("." = the root, named after $1)
    repo=$1; sha=$2; shift 2
    need=0; for skill in "$@"; do name=${skill##*/}; [ "$skill" = "." ] && name=${repo##*/}; [ -d "$HOME/.claude/skills/$name" ] || need=1; done
    if [ "$need" = 0 ]; then echo "skip $repo"; return; fi
    src=$(mktemp -d)
    if timeout 300 git clone -q "https://github.com/$repo" "$src/repo" && git -C "$src/repo" checkout -q "$sha"; then
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
  echo done
) > "$log" 2>&1 &
exit 0
