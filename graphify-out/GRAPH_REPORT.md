# Graph Report - Trame-de-presentation-DRANE-de-La-reunion-main  (2026-09-11)

## Corpus Check
- 18 files · ~129,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 573 nodes · 1289 edges · 27 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `render()` - 53 edges
2. `pushUndoSnapshot()` - 40 edges
3. `renderDashboard()` - 32 edges
4. `createSlideMarkup()` - 26 edges
5. `getSelectedSlide()` - 25 edges
6. `getSelectedCanvasData()` - 21 edges
7. `closeAddSlideMenu()` - 16 edges
8. `refreshStageOnly()` - 15 edges
9. `runPdfExportJob()` - 14 edges
10. `normalizeCanvasElement()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `refreshStageOnly()` --calls--> `scheduleStateSave()`  [EXTRACTED]
  src/app/main.js → src/app/main.js  _Bridges community 26 → community 7_
- `applySelectedRevealOrder()` --calls--> `pushUndoSnapshot()`  [EXTRACTED]
  src/app/main.js → src/app/main.js  _Bridges community 7 → community 19_
- `beginCanvasInteraction()` --calls--> `pushUndoSnapshot()`  [EXTRACTED]
  src/app/main.js → src/app/main.js  _Bridges community 7 → community 2_
- `createBlankSlide()` --calls--> `pushUndoSnapshot()`  [EXTRACTED]
  src/app/main.js → src/app/main.js  _Bridges community 7 → community 11_
- `resizeSelectedTable()` --calls--> `pushUndoSnapshot()`  [EXTRACTED]
  src/app/main.js → src/app/main.js  _Bridges community 7 → community 15_

## Import Cycles
- None detected.

## Communities (27 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (58): addBulletColumn(), addBulletSlide(), addContainedImage(), addFallbackImageSlide(), addFooter(), addFreeGallery(), addFreeLinksBlock(), addFreeSlide() (+50 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (55): buildBulletItems(), canvasHexToRgba(), clampCanvasMetric(), computeTableDensityLevel(), countBulletRevealSteps(), createBulletListMarkup(), createBulletPrimaryColumnMarkup(), createBulletSideColumnMarkup() (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): appendChartLightboxText(), applyCanvasTextEditorFontFamily(), applySlidePaletteVarsToNode(), beginCanvasInteraction(), clearCanvasTextSelectionBookmark(), clearUndoEditSession(), createCanvasTextSelectionBookmark(), createChartLightboxMarkup() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (51): addCanvasElement(), addCanvasMediaElement(), addPictoElement(), applyCanvasTextEditorBullets(), applyCanvasTextEditorFontSize(), applyCanvasTextEditorInlineTag(), applyCanvasTextEditorTextColor(), applyCanvasTextEditorTwoColumns() (+43 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (39): advanceHtmlEmbedsToFinalState(), buildPdfWorkerHtml(), buildPresentationHtml(), buildSlideTextExport(), collectSlideLinkRects(), downloadBlob(), exportHtml(), exportJson() (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (35): formatBytes(), formatCanvasMetric(), getCanvasData(), getCanvasElementLabel(), getCanvasElementTextPreview(), getCanvasFontOption(), getCanvasMediaSelectionText(), getDefaultTableFillColor() (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (34): blobToDataUrl(), cleanEmbedUrl(), createEmbedMedia(), createEmbedPlaceholderDataUrl(), createExternalMedia(), createImagePlaceholderDataUrl(), deleteMedia(), ensureObjectUrl() (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (34): addSelectedBullet(), addSelectedFreeLink(), addSelectedSubBullet(), endCanvasInteraction(), getEditableUndoTargetKey(), hydrateHtmlAssets(), hydrateMediaLibrary(), moveSelectedBullet() (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (34): clampCanvasMetric(), loadSlideClipboard(), loadState(), normalizeCanvasArrowLength(), normalizeCanvasRevealGroup(), normalizeCanvasRotation(), normalizeCanvasShapeKind(), normalizeCanvasShapeStrokeWidth() (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (18): applyFreeEditorBullets(), applyFreeEditorFontSize(), applyFreeEditorInlineStyle(), applyFreeEditorInlineTag(), applyFreeEditorTextColor(), applyFreeEditorTwoColumns(), findFreeEditorFormatAncestor(), findFreeEditorLayoutAncestor() (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (17): applyBloomLevel(), assignMediaToSelectedSlide(), clearSelectedHtmlEmbed(), collectPreservedStageMediaNodes(), getHtmlAssetUsageCount(), getSelectedSlide(), getStageRenderOptions(), importHtmlEmbedForSelectedSlide() (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (17): closeAddSlideMenu(), collectSlideMediaIds(), copyCurrentSlide(), createBlankSlide(), deleteCurrentSlide(), deleteSlideById(), duplicateCurrentSlide(), importJsonProject() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (15): createBridgeScript(), deleteAsset(), ensureRuntimeUrl(), exportRawSourceMap(), getRecord(), hydrateSlides(), importFile(), importSourceDataMap() (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (7): clampText(), escapeHtml(), extractLinks(), linkifyText(), plainTextToRichHtml(), sanitizeRichText(), uniqueStrings()

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (14): addSelectedVisualChartBar(), assignVisualMedia(), getDefaultVisualChartBar(), getDefaultVisualData(), getSelectedVisualData(), getVisibleVisualChartBars(), moveSelectedVisualChartBar(), normalizeVisualArrowColor() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (10): getSafeSelectedTableCell(), getSelectedTableFillColor(), getTableColumnCount(), normalizeHexColor(), normalizeTable(), resizeSelectedTable(), serializeTableCellKey(), syncTableCellFormatControls() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.43
Nodes (7): augmentMediaItems(), augmentMediaUrlMap(), createPictoItem(), getPictoAssetUrl(), getPictoMediaItems(), getPictoMediaUrlMap(), getPictoMimeType()

### Community 17 - "Community 17"
Cohesion: 0.43
Nodes (6): buildPresenterHtml(), getAvailableMediaItems(), getAvailableMediaUrls(), normalizeStartSlideIndex(), renderPresenterDocument(), serializeForScript()

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (7): createBlankSlide(), createBloomDeckSlides(), createDefaultCanvasData(), createDefaultHtmlEmbedData(), createDefaultState(), createDefaultVisualData(), createSlideFromBloom()

### Community 19 - "Community 19"
Cohesion: 0.38
Nodes (7): applySelectedRevealOrder(), getCanvasRevealOrderItems(), getHtmlRevealItem(), moveCanvasRevealOrder(), moveCanvasRevealToIndex(), normalizeCanvasRevealGroup(), normalizeRevealOrder()

### Community 20 - "Community 20"
Cohesion: 0.70
Nodes (4): getSlideCode(), getThemes(), renderMindMap(), wrapLabel()

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (6): createSavedColorButtons(), getSavedColors(), rememberColor(), renderColorMemories(), scheduleStateSave(), updateSelectedFreeBody()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `render()` connect `Community 7` to `Community 2`, `Community 3`, `Community 10`, `Community 11`, `Community 15`, `Community 19`, `Community 26`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `pushUndoSnapshot()` connect `Community 7` to `Community 2`, `Community 10`, `Community 11`, `Community 15`, `Community 19`, `Community 26`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0742447516641065 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07213114754098361 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07294117647058823 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09936575052854123 - nodes in this community are weakly interconnected._