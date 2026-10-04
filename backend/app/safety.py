import re

HAZARDS = (
    r"exposed.{0,30}(mains|live|electrical|wire)", r"(mains|live).{0,30}(wire|electric)",
    r"gas\s+(leak|smell)", r"smell.{0,15}gas", r"fire\s+damage", r"burning|sparking",
    r"(swollen|damaged|bulging).{0,30}(battery|lithium)",
    r"(battery|lithium).{0,30}(swollen|damaged|bulging)",
    r"(serious|severe).{0,20}structural", r"(cracked|broken).{0,20}(frame|load.bearing)",
)


def apply_safety(result, description, evidence):
    text = " ".join([description, *[item["description"] for item in evidence],
                     *[item.description for item in result.observations],
                     *[item.cause for item in result.hypotheses]])
    dangerous = any(re.search(pattern, text, re.I) for pattern in HAZARDS)
    if dangerous or result.safety.level == "HIGH" or result.risk_level == "HIGH":
        result.safety.level = "HIGH"
        result.risk_level = "HIGH"
        result.safety.reason = "A potentially dangerous condition requires professional assessment."
        result.safety.warning = "Stop DIY work and seek qualified professional assistance."
        result.next_action = "seek_professional_help"
        result.repair_steps = []
    elif result.safety.level == "UNKNOWN" or result.risk_level == "UNKNOWN":
        result.safety.level = result.risk_level = "UNKNOWN"
        result.repair_steps = []
    elif result.safety.level == "MEDIUM" or result.risk_level == "MEDIUM":
        result.safety.level = result.risk_level = "MEDIUM"
    caution = "An image cannot establish that an object is safe. Stop if conditions are uncertain."
    result.safety.warning = f"{result.safety.warning} {caution}" if result.safety.warning else caution
    return result
