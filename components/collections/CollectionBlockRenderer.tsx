import type { CollectionBlock } from "@/types/content";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { ImageTextBlock } from "./blocks/ImageTextBlock";
import { FeatureListBlock } from "./blocks/FeatureListBlock";
import { SolutionCardsBlock } from "./blocks/SolutionCardsBlock";
import { ApplicationGridBlock } from "./blocks/ApplicationGridBlock";
import { IndustryListBlock } from "./blocks/IndustryListBlock";
import { ComparisonTableBlock } from "./blocks/ComparisonTableBlock";
import { SelectionGuideBlock } from "./blocks/SelectionGuideBlock";
import { CtaBlock } from "./blocks/CtaBlock";

// Dispatches each controlled block type to its renderer — the only place
// that needs to know all block types exist (docs/09 "controlled block
// schema"). Callers just render <CollectionBlockRenderer blocks={...} />.
export function CollectionBlockRenderer({ blocks }: { blocks: CollectionBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "rich_text":
            return <RichTextBlock key={index} block={block} />;
          case "image_text":
            return <ImageTextBlock key={index} block={block} />;
          case "feature_list":
            return <FeatureListBlock key={index} block={block} />;
          case "solution_cards":
            return <SolutionCardsBlock key={index} block={block} />;
          case "application_grid":
            return <ApplicationGridBlock key={index} block={block} />;
          case "industry_list":
            return <IndustryListBlock key={index} block={block} />;
          case "comparison_table":
            return <ComparisonTableBlock key={index} block={block} />;
          case "selection_guide":
            return <SelectionGuideBlock key={index} block={block} />;
          case "cta":
            return <CtaBlock key={index} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
