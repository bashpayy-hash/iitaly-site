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
  echo done
) > "$log" 2>&1 &
exit 0
