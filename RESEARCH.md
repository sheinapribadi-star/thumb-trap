# Research brief: where a small alignment project can still help

This note is the reading I did before building Thumb Trap. It is a student brief, not a literature review, and it is honest about scale. The goal was to find one concrete gap I could study in public, with real model outputs and a metric a product or evals person could use.

## What the labs and institutes are already doing

**Anthropic.** Constitutional AI and Claude's public Constitution try to specify the kind of entity the model should be, then train and assess against those principles. Mechanistic interpretability asks a sharper question than output inspection: when a model answers, did it do so because it thought the answer was true, or because it thought the user wanted to hear it? The Safeguards Research team has worked on jailbreak robustness, constitutional classifiers, monitoring, and automated red teaming. Related empirical work includes sycophancy (Sharma, Tong, Perez, and coauthors), alignment faking, and sleeper-agent model organisms. Those last two are frontier-scale phenomena. I cannot reproduce them honestly with a 3-billion-parameter open model.

**OpenAI.** The Model Spec is a public behavior standard. It asks models not to be sycophantic: for objective questions, the factual answer should not move just because the user stated a view. In April 2025, a GPT-4o update became noticeably more sycophantic. Offline evals and small A/B tests looked fine. Thumbs-up feedback, which had been added as a reward signal, can favor more agreeable replies. The update was rolled back. Later system cards report progress on sycophancy, and Model Spec Evals measure compliance with the written spec. The lesson I took from the incident is an operations one: a launch metric can look green while the behavior the spec forbids is getting worse.

**Google DeepMind.** The technical AGI safety agenda treats amplified oversight (including debate) and robust training as the first line of defense against misalignment, and monitoring plus access control (AI control) as the second. Recent work on human-AI complementarity asks how to combine AI and human ratings without causing over-reliance. This is important, and it is larger than a week-long student build.

**METR.** METR measures autonomous capability, especially how long a model can work before it fails, and has started work on whether automated monitors actually catch misbehavior. Its task-based evals and industry risk assessments are infrastructure for labs, not a small interactive demo.

**Apollo Research.** Apollo studies scheming, evaluation awareness, and monitors for deceptive behavior, including pre-deployment work with frontier labs. Detecting strategic deception is the wrong target for a 3B model that is not a schemer.

**Redwood Research.** Redwood's AI-control agenda assumes an untrusted model and asks whether a protocol (monitors, auditing, or debate) can still prevent bad actions. Apart's control hackathons, including 2026 work on omission attacks, sit in this family.

**MATS and internships.** MATS streams cover interpretability, control, evaluations, and model organisms. They are the usual path into the work above, not an alternative agenda.

## Hackathon work I did not want to copy

Apart Research sprints have produced dataset-generation agents, interpretability probes, METR-style task implementations, and control protocols. Many of the winning projects are either (a) attempts to do a slice of lab research in a weekend, or (b) education tools. I did not want a thin reimplementation of Constitutional AI, a toy "scheming" demo that invents its evidence, or a chatbot wrapper around a lab paper.

## The gap I chose

Sycophancy is unusually well documented and unusually product-shaped. Sharma et al. (2023) showed that preference models often favor a convincing, agreeable reply over a truthful one, so optimizing for human preference can trade away honesty. OpenAI's 2025 incident showed the same tension inside a real launch process: thumbs-up data and A/B tests can reward the thing the Model Spec forbids.

Most public student demos of sycophancy stop at the obvious case, a model that starts saying Sydney is the capital of Australia once the user seems sure. That case still matters, and I included it. What I found less often was a small, inspectable eval of the *metric failure*: if you only count factual flips, you can miss the hedges, the face-saving openings, and the "I'm not saying you need to change" line that leaves a bad plan in place.

That is a natural project for someone recruiting into product, strategy, data science, or ops, rather than into mechanistic interpretability. It is also honest about limits. I can collect real outputs from an open model, publish them, score them against a written rubric, and show whether a flip-only score would have caught the change. I cannot claim this is how GPT or Claude would behave, and I cannot train a real reward model.

## What this project is, and is not

Thumb Trap is a 12-item paired eval plus a prompt-level stand-in for a thumbs-up objective. The primary metric is the face-saving gap: how much more often the model cushions the user's view when it is told to prefer replies the user is likely to rate highly, compared with a default helpful prompt. Flip rate is reported too, because a review that only tracks flips is the failure mode the project is about.

It is not frontier alignment research. It is not a claim about deployed ChatGPT or Claude. The satisfaction condition is a system prompt, not RLHF. The scores are mine, applied by hand, and the replies are in the repo so they can be argued with.

## Sources

- Mrinank Sharma, Meg Tong, Tomasz Korbak, David Duvenaud, Amanda Askell, Samuel R. Bowman, et al. "Towards Understanding Sycophancy in Language Models." ICLR 2024. https://arxiv.org/abs/2310.13548 and https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models
- OpenAI. "Expanding on what we missed with sycophancy." 2 May 2025. https://openai.com/index/expanding-on-sycophancy/
- OpenAI. Model Spec (latest public version consulted: 29 October 2026), including "Don't be sycophantic" and "Seek the truth together." https://model-spec.openai.com/2026-10-29.html
- OpenAI. "Inside our approach to the Model Spec" and Model Spec Evals. https://openai.com/index/our-approach-to-the-model-spec/ and https://alignment.openai.com/model-spec-evals
- Anthropic. "Recommendations for Technical AI Safety Research Directions." 2025. https://alignment.anthropic.com/2025/recommended-directions/
- Anthropic. "Introducing Anthropic's Safeguards Research Team." 2025. https://alignment.anthropic.com/2025/introducing-safeguards-research-team/
- Anthropic. Claude Constitution and Frontier Safety Roadmap updates. https://www.anthropic.com/responsible-scaling-policy/updates
- Rohin Shah et al. "An Approach to Technical AGI Safety and Security." DeepMind, 2025. https://arxiv.org/abs/2504.01849
- Google DeepMind. "Taking a responsible path to AGI" and Frontier Safety Framework updates.
- METR research page, including time-horizon measurement and monitoring evals. https://metr.org/research/
- Apollo Research. Scheming, evaluation awareness, and monitoring. https://www.apolloresearch.ai/
- Redwood Research. AI control project proposals, 2025. https://www.redwoodresearch.org/blog/recent-redwood-research-project-proposals
- Apart Research hackathon write-ups, including the METR Code Red evals sprint, the 2025 Martian interpretability sprint, and the 2026 AI Control Hackathon.
- MATS empirical track overview. https://www.matsprogram.org/tracks/empirical
