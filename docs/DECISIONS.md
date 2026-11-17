# Product decisions

## A tool before a showcase

The project demonstrates a reusable native-content workflow, not the volume of finished creative outputs. Its value is the visible relationship between reader interest, commercial intent, evidence and execution.

The smallest useful output is a defensible route plus a reading sample. A full article generator would obscure too many unresolved editorial decisions; a prompt library alone would not demonstrate how those decisions connect.

## Two deliberate generation steps

First extract material facts and develop three approaches. Then let a person select and revise an approach. Only then write the sample. This prevents an attractive first output from silently deciding the strategy.

The three perspectives are strategic, human and practical. The contract enforces categories and references; it cannot measure whether the ideas are truly distinct or good. That is a user decision.

## Evidence is a pointer

Facts refer to source excerpts through IDs and exact fragments. Routes and factual paragraphs refer to fact IDs. Exact matching catches fabricated fragments, unknown IDs and some broken handoffs. It does not prove that a fragment supports the claim, that a supplied source is reliable or that an edited framing sentence contains no additional fact.

## Material is not an instruction channel

System instructions mark all input fields as untrusted material. They prohibit invented quotes, interviews, observations and unsupported promises. The renderer escapes the result instead of trusting model HTML. These are separate controls: editorial prompting guides the model; rendering controls constrain what the browser executes.

## Keep creative work in one interface

The copy-and-paste handoff interrupted the workflow. It has been removed from the product interface. Automatic generation must run through a configured server-side account; unavailable generation is clearly identified and disabled. A fixture is never represented as new generation.

Teaser text cards now open an inline creator. Kicker, headline, body, arrow colour, image and format can be edited and previewed. Their preview opens the existing reading sample; exported HTML uses an explicitly supplied destination. PNG/SVG output is a creative concept and still needs platform-specific review before placement.

## What to evaluate next

- Do three materially different briefs lead to materially different concepts?
- Does each selected angle make the sponsor's contribution clear without turning the opening into a sales pitch?
- Do teasers promise something the reading sample actually delivers?
- Can a colleague move from a route to a reading sample and teasers inside the interface once the model is connected?
- Which validation errors point to a prompt problem, and which point to insufficient material?

No measured time saving, creative-quality score or business impact is claimed by this prototype.

## Native template alignment

The creator now follows the supplied Native production references, including privately configured Franklin Gothic FS Book/Demi, one kicker, a white background, black copy and a STORY sender with arrow. The typography endpoint outlines copy without receiving image bytes. Preview and exported assets share those paths; production font files are excluded from source control and exports. See NATIVE-DESIGN.md for the reference scope and remaining sender/crop limits.
