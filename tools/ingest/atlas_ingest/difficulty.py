"""Dificuldade estimada de itens do ENEM por TRI (modelo logístico de 3 parâmetros).

Metodologia (documentada em docs/dificuldade.md):
  P(acerto | theta) = c + (1 - c) * p*      p* = 1 / (1 + exp(-D * a * (theta - b)))
com a, b, c do ITENS_PROVA (escala (0,1) do Enem, em que theta = 0 corresponde a 500 pontos), D = 1,7 e
theta de referência = 0. P é a probabilidade de acerto de um participante de proficiência de referência;
p* é essa probabilidade descontado o acerto ao acaso (c). A classificação usa p*, porque c varia entre itens
e, em P, um item muito difícil com c alto pareceria mais fácil que um item de dificuldade média.
Os cortes não são fixados à mão: são os tercis da distribuição de p* entre TODOS os itens de CN presentes
nos microdados processados (arquivo difficulty_calibration.json, recalculado de forma reprodutível).
p* alto = Básica; p* no tercil do meio = Intermediária; p* baixo = Avançada.
O resultado é uma estimativa por modelo, não a taxa de acerto observada."""
import math

from .common import INGEST, read_json, write_json

D = 1.7
THETA_REF = 0.0
CAL_PATH = INGEST / "difficulty_calibration.json"
LABELS = ("Avançada", "Intermediária", "Básica")      # do menor P ao maior P


def p_star(a, b, theta=THETA_REF, d=D):
    """Probabilidade de dominar o item (sem acerto ao acaso)."""
    return 1 / (1 + math.exp(-d * a * (theta - b)))


def p_ref(a, b, c, theta=THETA_REF, d=D):
    return c + (1 - c) * p_star(a, b, theta, d)


def quantile(sorted_vals, q):
    if not sorted_vals:
        raise ValueError("sem valores")
    pos = q * (len(sorted_vals) - 1)
    lo, hi = math.floor(pos), math.ceil(pos)
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (pos - lo)


def calibrate(rows_by_year):
    """rows_by_year: {ano: linhas de ITENS_PROVA}. Grava e devolve a calibração."""
    seen, ps = set(), []
    for year, rows in sorted(rows_by_year.items()):
        for r in rows:
            if r["SG_AREA"] != "CN" or not (r["NU_PARAM_A"] and r["NU_PARAM_B"] and r["NU_PARAM_C"]):
                continue
            key = (year, r["CO_ITEM"])
            if key in seen:
                continue
            seen.add(key)
            ps.append(p_star(float(r["NU_PARAM_A"]), float(r["NU_PARAM_B"])))
    ps.sort()
    cal = {
        "model": "3PL", "D": D, "theta_ref": THETA_REF, "area": "CN", "years": sorted(rows_by_year),
        "n_items": len(ps), "cut_low": round(quantile(ps, 1 / 3), 5), "cut_high": round(quantile(ps, 2 / 3), 5),
        "p_min": round(ps[0], 5), "p_median": round(quantile(ps, 0.5), 5), "p_max": round(ps[-1], 5),
        "metric": "p_star", "method": "tercis da distribuição de p* (probabilidade de dominar o item, sem acerto ao acaso) em theta_ref entre todos os itens CN dos anos processados",
    }
    write_json(CAL_PATH, cal)
    return cal


def label_for(irt, cal=None):
    cal = cal or read_json(CAL_PATH)
    if not cal or not irt or None in (irt.get("a"), irt.get("b"), irt.get("c")):
        return None
    ps = p_star(irt["a"], irt["b"])
    tier = LABELS[0] if ps <= cal["cut_low"] else LABELS[1] if ps <= cal["cut_high"] else LABELS[2]
    return {"diff": tier, "diff_method": "irt_p_ref",
            "diff_stats": {"p_star": round(ps, 4), "p_ref": round(p_ref(irt["a"], irt["b"], irt["c"]), 4), **{k: irt[k] for k in "abc"}}}
