<template>
  <span>{{ text }}</span>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'
import { useI18n } from "vue-i18n"

import { usePageContext } from '../renderer/usePageContext'
import { translate } from '../locales'

const slots = useSlots();
const { t } = useI18n();

const getSlotChildrenText = children => children.map(node => {
  if (!node.children || typeof node.children === 'string') return node.children || ''
  else if (Array.isArray(node.children)) return getSlotChildrenText(node.children)
  else if (node.children.default) return getSlotChildrenText(node.children.default())
}).join('');

const rawText = getSlotChildrenText(slots.default());
const text = t(rawText);
</script>
