// Saved fictional example. No live model output.
export const demoBrief = {
  "brand": "WEITER · fiktive Beispielmarke",
  "objective": "Die Möglichkeit einer gezielten Bürostuhl-Reparatur verständlich machen und Interesse an einer individuellen Bestandsprüfung wecken.",
  "audience": "Menschen, die Büroflächen betreuen und über die Zukunft vorhandener Möbel entscheiden.",
  "occasion": "Eine freie Konzeptstudie über den nächsten Lebensabschnitt eines Bürostuhls.",
  "publisher": "Regionales Nachrichtenmedium. Die Leser:innen erwarten konkrete Einblicke in Arbeit und Alltag, nachvollziehbare Aussagen und eine klare Trennung von Werbung und Redaktion.",
  "constraints": "Die Marke und sämtliche Materialangaben sind erfunden. Keine behaupteten Umweltvorteile, Erfahrungen von Kund:innen, Lebensdauern oder Interviews. Eine ausdrücklich fiktive Demonstration des Werkzeugs.",
  "sources": [
    {
      "id": "S1",
      "title": "Fiktives Materialblatt · WEITER",
      "url": "",
      "excerpt": "WEITER ist eine für diese Demonstration erfundene Marke. Das folgende Material beschreibt ein ausgedachtes Angebot, kein reales Unternehmen. Jeder Bürostuhl wird einzeln geprüft. Je nach Modell können Sitzbezüge, Rollen und bestimmte Mechaniken ersetzt werden. Wiederverwendbare Teile werden bei der Prüfung gesondert erfasst. Auf die Bestandsaufnahme folgt eine individuelle Maßnahmenliste. Reparaturen übernimmt eine Partnerwerkstatt. Nicht jeder Stuhl und nicht jeder Schaden eignet sich für eine Reparatur. Eine Rücknahme wird nur für ausgewählte Modelle angeboten. Es liegen keine Lebenszyklusanalyse, keine garantierte Nutzungsdauer und keine dokumentierten Erfahrungsberichte vor."
    }
  ]
};

export const demoAnalysis = {
  "status": "ready",
  "material_summary": "Das Material beschreibt eine Einzelprüfung und den Austausch bestimmter Bauteile. Für einen recherchierten Beitrag fehlen ein dokumentierter Fall, eine beteiligte Person und der Zugang zur Werkstatt.",
  "facts": [
    {
      "id": "F1",
      "claim": "Im fiktiven Angebot wird jeder Bürostuhl einzeln geprüft.",
      "source_id": "S1",
      "quote": "Jeder Bürostuhl wird einzeln geprüft."
    },
    {
      "id": "F2",
      "claim": "Sitzbezüge, Rollen und bestimmte Mechaniken sind je nach Modell austauschbar.",
      "source_id": "S1",
      "quote": "Je nach Modell können Sitzbezüge, Rollen und bestimmte Mechaniken ersetzt werden."
    },
    {
      "id": "F3",
      "claim": "Auf die Bestandsaufnahme folgt eine individuelle Maßnahmenliste.",
      "source_id": "S1",
      "quote": "Auf die Bestandsaufnahme folgt eine individuelle Maßnahmenliste."
    },
    {
      "id": "F4",
      "claim": "Die Reparatur ist nicht für jeden Stuhl oder Schaden geeignet.",
      "source_id": "S1",
      "quote": "Nicht jeder Stuhl und nicht jeder Schaden eignet sich für eine Reparatur."
    },
    {
      "id": "F5",
      "claim": "Reparaturen werden von einer Partnerwerkstatt übernommen.",
      "source_id": "S1",
      "quote": "Reparaturen übernimmt eine Partnerwerkstatt."
    }
  ],
  "routes": [
    {
      "id": "R1",
      "kind": "strategisch",
      "title": "Was an einem Bürostuhl austauschbar ist",
      "reader_question": "Welche Teile lassen sich ersetzen, bevor ein neuer Stuhl gekauft wird?",
      "insight": "Die Prüfung einzelner Bauteile erklärt das Angebot konkreter als eine allgemeine Aussage über Langlebigkeit.",
      "concept": "Eine Darstellung zeigt Rollen, Bezug und Mechanik getrennt. Zu jedem Bauteil wird erklärt, was sich prüfen und je nach Modell ersetzen lässt.",
      "brand_role": "WEITER liefert die fachliche Perspektive auf die Bestandsaufnahme. Die Marke verspricht kein pauschales Ergebnis.",
      "publisher_fit": "Ein gebräuchliches Arbeitsmöbel eignet sich, um Reparatur und Beschaffung zu erklären.",
      "creative_mechanic": "Eine visuelle Explosionszeichnung mit drei anklickbaren Bauteilen. Die Funktion müsste separat gebaut und fachlich geprüft werden.",
      "opening_hook": "Was bleibt von einem Stuhl, wenn eine Rolle nicht mehr mitmacht?",
      "evidence_ids": [
        "F1",
        "F2",
        "F4"
      ],
      "research_gaps": [
        "Ein tatsächlich reparierbares Modell und freigegebene Detailaufnahmen beschaffen.",
        "Die technische Darstellung von Fachleuten prüfen lassen."
      ],
      "visual_direction": "graphic"
    },
    {
      "id": "R2",
      "kind": "menschlich",
      "title": "Eine kaputte Rolle. Ein neuer Stuhl?",
      "reader_question": "Muss der ganze Stuhl ersetzt werden, wenn ein einzelnes Teil defekt ist?",
      "insight": "Die Frage nach einem defekten Bauteil führt zur Prüfung des vorhandenen Stuhls.",
      "concept": "Der Text beginnt mit der Frage nach einer defekten Rolle. Danach erklärt er die Einzelprüfung, mögliche Ersatzteile und die Grenzen einer Reparatur. Detailaufnahmen sollen die beschriebenen Teile zeigen.",
      "brand_role": "WEITER beschreibt das im Beispiel angelegte Prüfverfahren und die anschließende Maßnahmenliste.",
      "publisher_fit": "Der Beitrag richtet sich an Leser:innen, die Büroflächen betreuen oder über vorhandene Möbel entscheiden.",
      "creative_mechanic": "Detailaufnahmen zeigen Rolle, Bezug und Mechanik. Ein realer Fall müsste dafür recherchiert und fotografiert werden.",
      "opening_hook": "Was tun, wenn eine Rolle nicht mehr dreht – den ganzen Stuhl ersetzen oder das Bauteil prüfen?",
      "evidence_ids": [
        "F1",
        "F2",
        "F3",
        "F4",
        "F5"
      ],
      "research_gaps": [
        "Einen realen Stuhl mit dokumentierter Prüfung auswählen.",
        "Werkstatt und beteiligte Personen recherchieren; keine Mitwirkung ist zugesagt."
      ],
      "visual_direction": "editorial"
    },
    {
      "id": "R3",
      "kind": "pragmatisch",
      "title": "Behalten, reparieren oder weitergeben?",
      "reader_question": "Welche Informationen brauche ich vor der Entscheidung über vorhandene Bürostühle?",
      "insight": "Vor der Entscheidung über eine Reparatur fehlen oft Angaben zum konkreten Möbel. Die Checkliste sammelt die Fragen für eine Prüfung.",
      "concept": "Eine Checkliste erfasst Modell, Zustand und betroffene Teile. Das Ergebnis ist eine Übersicht für die fachliche Prüfung, keine automatische Reparaturempfehlung.",
      "brand_role": "WEITER erklärt, welche Informationen für eine individuelle Prüfung gebraucht werden.",
      "publisher_fit": "Die Checkliste hilft Leser:innen, Informationen über vorhandene Bürostühle zusammenzustellen.",
      "creative_mechanic": "Eine schrittweise Checkliste mit editierbarer Zusammenfassung. Keine automatische Reparaturdiagnose oder Umweltersparnis.",
      "opening_hook": "Bevor der Stuhl geht: Was wissen wir eigentlich über ihn?",
      "evidence_ids": [
        "F1",
        "F3",
        "F4"
      ],
      "research_gaps": [
        "Prüfkriterien mit einer Fachperson entwickeln.",
        "Die Checkliste mit Nutzer:innen erproben."
      ],
      "visual_direction": "immersive"
    }
  ],
  "missing_material": []
};

export const demoDraft = {
  "headline": "Eine kaputte Rolle. Ein neuer Stuhl?",
  "kicker": "Arbeit & Gestaltung · fiktive Konzeptstudie",
  "teaser": "Was tun, wenn eine Rolle nicht mehr dreht oder der Bezug durch ist? Die Prüfung einzelner Bauteile kann klären, welche Möglichkeiten für den vorhandenen Stuhl bestehen.",
  "opening": [
    {
      "text": "Was tun, wenn eine Rolle nicht mehr dreht oder der Bezug durch ist? Den ganzen Stuhl ersetzen – oder erst prüfen, was sich reparieren lässt? Bevor die Entscheidung fällt, geht es um das konkrete Modell und die betroffenen Teile.",
      "kind": "framing",
      "evidence_ids": []
    },
    {
      "text": "Die fiktive Marke WEITER sieht in ihrem Beispielangebot eine Einzelprüfung vor. Je nach Modell lassen sich Sitzbezüge, Rollen und bestimmte Mechaniken ersetzen. Welche Teile infrage kommen, wird für den jeweiligen Stuhl geprüft.",
      "kind": "sourced",
      "evidence_ids": [
        "F1",
        "F2"
      ]
    },
    {
      "text": "Für eine Bestandsaufnahme stellen sich damit konkrete Fragen: Welches Modell ist vorhanden? Was ist beschädigt? Und was lässt sich daran überhaupt austauschen? Eine Liste mit diesen Angaben wäre der Ausgangspunkt für die weitere Prüfung.",
      "kind": "framing",
      "evidence_ids": []
    }
  ],
  "explainer_heading": "Die Maßnahmenliste kommt vor der Reparatur",
  "explainer": [
    {
      "text": "Auf die Bestandsaufnahme folgt im WEITER-Beispiel eine individuelle Maßnahmenliste. Sie hält fest, welche Arbeiten für den geprüften Stuhl vorgesehen sind. Reparaturen übernimmt eine Partnerwerkstatt. Der Ablauf beginnt also beim vorhandenen Möbel und dessen Zustand.",
      "kind": "sourced",
      "evidence_ids": [
        "F3",
        "F5"
      ]
    },
    {
      "text": "Die Prüfung kann auch zu einem anderen Ergebnis führen: Nicht jeder Stuhl und nicht jeder Schaden eignet sich für eine Reparatur. Welche Arbeiten tatsächlich möglich sind, bleibt bis zur Prüfung offen. Aus der Möglichkeit, einzelne Teile zu ersetzen, folgt deshalb noch keine Zusage für einen bestimmten Stuhl.",
      "kind": "sourced",
      "evidence_ids": [
        "F4"
      ]
    }
  ],
  "takeaway": "Der Zustand einzelner Teile ist der Ausgangspunkt. Die Entscheidung über den ganzen Stuhl folgt nach der Prüfung.",
  "continue_question": "Welche Angaben braucht die Werkstatt für eine Prüfung?",
  "teasers": [
    {
      "angle": "Einstieg über ein Bauteil",
      "headline": "Eine kaputte Rolle. Ein neuer Stuhl?",
      "body": "Rolle, Bezug oder Mechanik: Was lässt sich austauschen, bevor ein ganzer Bürostuhl ersetzt wird? Ein Blick auf die Einzelprüfung.",
      "cta": "Leseprobe öffnen"
    },
    {
      "angle": "Frage der Leser:innen",
      "headline": "Was lässt sich an diesem Stuhl ersetzen?",
      "body": "Im Beispielangebot von WEITER werden Rollen, Bezüge und bestimmte Mechaniken geprüft. Welche Möglichkeiten gibt es – und wo liegen die Grenzen?",
      "cta": "Leseprobe öffnen"
    },
    {
      "angle": "Ablauf der Prüfung",
      "headline": "Was eine Bestandsaufnahme klären soll",
      "body": "Auf die Einzelprüfung folgt im WEITER-Beispiel eine Liste möglicher Maßnahmen. Eine Reparatur ist für manche Stühle und Schäden ausgeschlossen.",
      "cta": "Leseprobe öffnen"
    }
  ],
  "production_notes": [
    "Gespeichertes, von Hand verfasstes Beispiel. Kein Ergebnis einer Live-Generierung.",
    "WEITER und das Angebot sind erfunden. Für eine reale Umsetzung Material durch geprüfte Quellen ersetzen.",
    "Einen dokumentierten Fall, Bildrechte und Werkstattzugang klären. Keine Umwelt- oder Lebensdauerversprechen ableiten."
  ]
};

export const realBriefs = {
  "kaercher": {
    "brand": "Kärcher",
    "objective": "Das Thema Reinigung als fachliche Auseinandersetzung mit einem historischen Objekt erzählen. Ein konkreter Einblick soll Interesse an der Expertise hinter der Marke wecken.",
    "audience": "Menschen mit Interesse an Stadtgeschichte, Kultur und der Pflege öffentlicher Orte.",
    "occasion": "Freie Konzeptstudie zur historischen Reinigung des Brandenburger Tors.",
    "publisher": "Regionales Nachrichtenmedium. Die Leser:innen erwarten konkrete Einblicke in Arbeit und Alltag, nachvollziehbare Aussagen und eine klare Trennung von Werbung und Redaktion.",
    "constraints": "Keine aktuelle Beauftragung, keine Zusammenarbeit mit einem Publisher behaupten. Keine Vor-Ort-Beobachtungen erfinden. Der Auszug ist eine redaktionelle Zusammenfassung einer Quelle des Unternehmens, kein unabhängiger Beleg für Wirkung.",
    "sources": [
      {
        "id": "S1",
        "title": "Kärcher · Brandenburger Tor (zusammengefasst)",
        "url": "https://www.kaercher.com/int/inside-kaercher/company/sponsoring/cultural-sponsorship/brandenburger-tor.html",
        "excerpt": "Redaktionelle Zusammenfassung der offiziellen Kärcher-Projektseite: Kärcher beschreibt die Reinigung des Brandenburger Tors zwischen Mai und September 1990. Das Unternehmen stellt die Arbeit als Beitrag seines Kultursponsorings dar. Bei der Reinigung sollte die historische Patina erhalten bleiben. Die Seite verbindet damit technische Reinigung und den Umgang mit einem historischen Bauwerk. Dieser kurze Auszug enthält keine Interviews, keine aktuellen Projektzusagen und keine Angaben über Kosten, Reichweite oder wirtschaftliche Wirkung."
      }
    ]
  },
  "leica": {
    "brand": "Leica",
    "objective": "Die Unterscheidung zwischen nachvollziehbarer Bildherkunft und inhaltlicher Wahrheit verständlich machen und das Interesse an fotografischer Urheberschaft wecken.",
    "audience": "Menschen, die Fotografie nutzen und sich fragen, welche Informationen ein digitales Bild glaubwürdiger machen.",
    "occasion": "Freie Konzeptstudie über die Herkunft digitaler Bilder.",
    "publisher": "Regionales Nachrichtenmedium. Die Leser:innen erwarten konkrete Einblicke in Arbeit und Alltag, nachvollziehbare Aussagen und eine klare Trennung von Werbung und Redaktion.",
    "constraints": "Keine Beauftragung oder Zusammenarbeit behaupten. Content Credentials nicht als Wahrheitsbeweis darstellen. Keine Aussagen über alle Kameramodelle oder erfundene Fotograf:innen.",
    "sources": [
      {
        "id": "S1",
        "title": "Leica · Content Credentials (zusammengefasst)",
        "url": "https://leica-camera.com/en-int/photography/content-credentials",
        "excerpt": "Redaktionelle Zusammenfassung der offiziellen Leica-Seite: Leica erläutert Content Credentials als Informationen zur Herkunft und Bearbeitung digitaler Bilder. Die Informationen können die Entstehung eines Bildes und dessen Bearbeitungsverlauf nachvollziehbarer machen. Die dokumentierte Herkunft ist von der Frage zu unterscheiden, ob der dargestellte Inhalt wahr oder vollständig ist. Das Material enthält keinen Beleg dafür, dass ein Bild mit Content Credentials automatisch eine wahrheitsgemäße Darstellung der Situation liefert. Es nennt keine für diese Konzeptstudie zugesagten Gesprächspartner:innen."
      }
    ]
  },
  "vitra": {
    "brand": "Vitra",
    "objective": "Den nächsten Nutzungsabschnitt von Büromöbeln als konkrete Gestaltungs- und Beschaffungsfrage erzählen und Interesse an zirkulären Angeboten im Objektgeschäft wecken.",
    "audience": "Menschen, die Büroflächen planen, betreuen oder ausstatten und über vorhandene Möbel entscheiden.",
    "occasion": "Freie Konzeptstudie zu Circle for Contract.",
    "publisher": "Regionales Nachrichtenmedium. Die Leser:innen erwarten konkrete Einblicke in Arbeit und Alltag, nachvollziehbare Aussagen und eine klare Trennung von Werbung und Redaktion.",
    "constraints": "Keine Zusammenarbeit oder Praxisfälle erfinden. B2B-Angebot nicht auf sämtliche Produkte für Privatkund:innen übertragen. Keine eigenen CO₂-Ersparnisse oder garantierten Lebensdauern ableiten.",
    "sources": [
      {
        "id": "S1",
        "title": "Vitra · Circularity as a concept (zusammengefasst)",
        "url": "https://www.vitra.com/de-de/magazine/details/circularity-as-a-concept",
        "excerpt": "Redaktionelle Zusammenfassung der offiziellen Vitra-Darstellung: Vitra beschreibt Circle for Contract als Angebot für das Objektgeschäft. Es verbindet die Rücknahme von Büromöbeln mit deren Aufarbeitung und einem erneuten Verkauf. Vorhandene Möbel erhalten damit einen vorgesehenen nächsten Nutzungsabschnitt innerhalb eines beschriebenen Angebots. Dieser Auszug enthält keine vollständigen Teilnahmebedingungen, keine Lebenszyklusanalyse und keine garantierte Nutzungsdauer. Eine konkrete Einsparung von Ressourcen oder Emissionen lässt sich aus dem Auszug nicht berechnen."
      }
    ]
  }
};
