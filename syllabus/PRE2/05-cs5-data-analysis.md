# Data analysis

**Paper II — CSAT** › Civil Services Aptitude Test · Subject: CSAT (Paper II) · Priority: High · **Asked by PPSC: 🔁 25× (’21 ’25)**

> Official syllabus line: Data analysis; graphic presentations, charts, tables, spreadsheets.

[Study this in the app](https://mangeshwarsinghp14.github.io/PCS-Prep/#node/cs5) · [Index](../README.md)

## Short notes

- Read titles, units, scale and footnotes before the numbers; many errors come from lakh vs crore or % vs absolute values.
- Percentage change = (new - old)/old x 100. Always divide by the OLD (base) value.
- Percentage points vs percent: a rate going from 8% to 10% rises by 2 percentage points but by 25 percent.
- Share of a part = part/total x 100. A rising share does not mean the part itself rose if the total fell.
- Pie chart: 100% = 360 degrees, so 1% = 3.6 degrees. Central angle = (value/total) x 360.
- Bar charts compare categories; line graphs show trends over time; the steepest segment shows the largest absolute change, not necessarily the largest % change.
- Growth over many years: CAGR approx; for quick checks, doubling in about 72/r years at r% growth (rule of 72).
- Mean = sum/count; median = middle value of sorted data (average of two middle values if count is even); mode = most frequent value.
- Weighted average = sum(value x weight)/sum(weights); used for averages of groups of different sizes.
- Approximation: round to 2 significant figures when options are far apart; compute exactly when options are close.
- Ratio questions: compare a/b with c/d by cross-multiplication rather than computing decimals.
- Tables: total rows and columns once and write them beside the table; many questions reuse them.
- Spreadsheets: cells are named column-row (B3); formulas start with '='; ranges use a colon (A1:A10).
- Common functions: SUM, AVERAGE, MAX, MIN, COUNT (counts numbers), COUNTA (non-empty cells), IF(condition, value_if_true, value_if_false).
- Relative reference (A1) shifts when a formula is copied; absolute reference ($A$1) stays fixed; $A1 fixes the column, A$1 fixes the row.
- Operator precedence in spreadsheets follows maths: brackets, then powers (^), then * and /, then + and -.
- Data sufficiency style: decide whether the given data can answer the question before calculating.

## Punjab angle

- Punjab Economic Survey 2025-26 data (sector shares agriculture 23%, industry 29%, services 48%) is a good example of a pie-chart style composition question.
- Practise with real tables from the Punjab Statistical Abstract and Economic Survey: district-wise crop area, yields and GSDP shares.

## How PPSC asks it

Expect a small table, bar, line or pie chart with 2-4 questions on percentage change, share, ratio and averages, plus basic spreadsheet formula logic. Master base-value discipline and the pie-chart degree rule.

## Deep dive

### What PPSC asks — pattern from 2021 and 2025

- 2021 had about 17 data questions: a network diagram of an airline's trips to six cities, two-test selection rules, a Venn-type survey of 500 cinema artists, a flight-booking price-scheme diagram, apples plucked over ten days, an ODI cricket career table, line charts and pie charts of wild-animal populations.
- 2025 had about 8: a five-year table of applications received and candidates selected by discipline (percentage selected), and a five-question information set.
- Pattern: one data set usually carries 2-5 questions — invest in reading the set once, carefully, and the follow-up questions become quick.
- Skills tested: percentage and percentage-point change, share of total, ratio comparison, averages, set (Venn) counting, reading unusual diagrams (networks, price slabs).
- Spreadsheet-type questions (formulas, references) are in the syllabus wording and in your short notes; they appear more in UPSC than in PPSC so far.
- Data sets are a good place to secure 6-10 marks with moderate effort.

### Method sheet — reading and computing

- Before numbers: read the title, units (lakh, crore, thousand, %), time period, and footnotes; write the units next to the table.
- Totals first: add row and column totals once and write them down; at least one question will use them.
- Percentage change = (new - old) / old x 100; for a quick comparison of growth across rows, compare change/old ratios as fractions.
- Share of a part in a total = part / total; a share can fall even when the part is unchanged if the total grows (watch Patiala-type traps).
- Compound annual growth rate: (final / initial)^(1/n) - 1; for small rates the simple average (total % change / n) slightly overstates it; rule of 72 gives doubling time.
- Weighted average = sum (value x weight) / sum (weights); adding an item equal to the current average leaves the average unchanged.
- Ratio comparison without division: a/b > c/d if a x d > b x c.
- Pie charts: 100% = 360 degrees, so 1% = 3.6 degrees; if one sector's value is known, total = value / its share.
- Line and bar graphs: the steepest segment shows the largest absolute change; the largest percentage change needs division by the base.

### Sets and Venn diagrams (PPSC 2021 surveyed 500 artists)

- Two sets: n(A or B) = n(A) + n(B) - n(A and B); none = total - n(A or B).
- Three sets: n(A or B or C) = n(A) + n(B) + n(C) - n(AB) - n(BC) - n(CA) + n(ABC).
- Exactly two (from pairwise totals that include the triple overlap) = [n(AB) + n(BC) + n(CA)] - 3 x n(ABC).
- Exactly one = n(A) + n(B) + n(C) - 2 x [n(AB) + n(BC) + n(CA)] + 3 x n(ABC).
- Fill a Venn diagram from the centre outward: put the triple overlap first, then the 'only two' regions, then the 'only one' regions.
- 'At least' questions: minimum overlap of A and B = n(A) + n(B) - total (if positive); maximum overlap = the smaller of n(A) and n(B).
- Always check that all regions add up to the total — a quick error check.

### Time strategy for data sets

- Skim all data sets in the first two minutes of the section and start with the one that has the most questions and the simplest format (tables before network diagrams).
- Budget about 1 minute of reading plus 1 minute per question; if a set needs a long calculation, answer the easy questions in it and move on.
- Use the options: many DI questions can be solved by rough estimation once the order of magnitude is known.
- Write intermediate numbers (totals, shares) on the question paper so later questions reuse them.
- Do not leave a data question blank — eliminate impossible options and guess.
- Practise with real tables (Punjab Economic Survey, Census and NFHS fact sheets) so unfamiliar formats in the exam do not slow you down.

### Common traps

- Dividing by the new value instead of the old value for percentage change.
- Reading '%' data as absolute numbers and adding percentages from different bases.
- Assuming a larger slice of a bigger pie means a larger share of a smaller pie — compare absolute values only after converting.
- Using a simple average where a weighted average is needed (groups of different sizes).
- Ignoring blank or text cells in spreadsheet functions — AVERAGE and COUNT skip them, COUNTA counts text.
- Double-counting overlaps in Venn diagrams.

## Free reading (official and open sources)

- [NCERT Class 11 Statistics for Economics — Ch 4 Presentation of Data](https://ncert.nic.in/textbook/pdf/kest104.pdf)
- [NCERT Class 11 Statistics for Economics — Ch 3 Organisation of Data](https://ncert.nic.in/textbook/pdf/kest103.pdf)
- [NCERT Class 11 Statistics for Economics — Ch 5 Measures of Central Tendency](https://ncert.nic.in/textbook/pdf/kest105.pdf)
- [NCERT Class 10 Mathematics — Ch 13 Statistics](https://ncert.nic.in/textbook/pdf/jemh113.pdf)
- [NIOS Economics (318) — L6 Collection and Classification of Data, L7 Presentation of Data, L8 Measures of Central Tendency, L9 Measures of Dispersion, L11 Index Numbers](https://nios.ac.in/online-course-material/sr-secondary-courses/economics-(318).aspx)
- [Khan Academy — Statistics and probability (data displays, averages, Venn diagrams)](https://www.khanacademy.org/math/statistics-probability)
- [UPSC — Previous question papers (CSAT data interpretation sets)](https://www.upsc.gov.in/examinations/previous-question-papers)

## Books

- **How to Prepare for Data Interpretation** — Arun Sharma (McGraw Hill): Systematic DI methods (tables, bar, line, pie, caselets) with approximation techniques; use the early chapters for CSAT level.
- **Quantitative Aptitude for Competitive Examinations (Data Interpretation section)** — R.S. Aggarwal (S. Chand): Large bank of tabulation, bar, pie and line graph sets with solutions.
- **CSAT Paper II Manual (data interpretation and data sufficiency chapters)** — Arihant / McGraw Hill (latest edition): Exam-pattern DI sets including Venn and caselet types.

## Sources the notes follow

- NCERT Class 9 and 10 Mathematics (Statistics chapters)
- R.S. Aggarwal, Data Interpretation
- Punjab Economic Survey 2025-26 (tables for practice)
- UPSC CSAT and PPSC Prelims Paper II previous papers

## Asked in PPSC papers — 25 times (in 2 of 3 recent exams)

| Paper | Years asked |
|---|---|
| Prelims CSAT | 2021 (×17), 2025 (×8) |

- [Prelims 2025 · CSAT Q2](../../past-papers/pre_2025_CSAT.md#q2) — Directions (Question No. 2-4) : Study the table carefully and answer the questions given below.
- [Prelims 2025 · CSAT Q3](../../past-papers/pre_2025_CSAT.md#q3) — Directions (Question No. 2-4) : Study the table carefully and answer the questions given below.
- [Prelims 2025 · CSAT Q4](../../past-papers/pre_2025_CSAT.md#q4) — Directions (Question No. 2-4) : Study the table carefully and answer the questions given below.
- [Prelims 2025 · CSAT Q12](../../past-papers/pre_2025_CSAT.md#q12) — Directions (Question No. 12-16) : Study the following information to answer the questions given below :
- [Prelims 2025 · CSAT Q13](../../past-papers/pre_2025_CSAT.md#q13) — Directions (Question No. 12-16) : Study the following information to answer the questions given below :
- [Prelims 2025 · CSAT Q14](../../past-papers/pre_2025_CSAT.md#q14) — Directions (Question No. 12-16) : Study the following information to answer the questions given below :
- [Prelims 2025 · CSAT Q15](../../past-papers/pre_2025_CSAT.md#q15) — Directions (Question No. 12-16) : Study the following information to answer the questions given below :
- [Prelims 2025 · CSAT Q16](../../past-papers/pre_2025_CSAT.md#q16) — Directions (Question No. 12-16) : Study the following information to answer the questions given below :
- [Prelims 2021 · CSAT Q15](../../past-papers/pre_2021_CSAT.md#q15) — Based on the information given below and diagram of an Airline's trips to 6 cities from New Delhi in the year 2015 :
- [Prelims 2021 · CSAT Q16](../../past-papers/pre_2021_CSAT.md#q16) — Based on the information given below and diagram of an Airline's trips to 6 cities from New Delhi in the year 2015 :
- [Prelims 2021 · CSAT Q19](../../past-papers/pre_2021_CSAT.md#q19) — An automobile company calls shortlisted applicants for two written tests (E1 – general scientific background; E2 – basics of the discipline) and a viva. To cut 
- [Prelims 2021 · CSAT Q20](../../past-papers/pre_2021_CSAT.md#q20) — An automobile company calls shortlisted applicants for two written tests (E1 – general scientific background; E2 – basics of the discipline) and a viva. To cut 
- [Prelims 2021 · CSAT Q21](../../past-papers/pre_2021_CSAT.md#q21) — A survey was conducted on a sample of 500 cinema artists with reference to their proficiency in the skill of acting, singing and dancing. [Venn diagram describe
- [Prelims 2021 · CSAT Q22](../../past-papers/pre_2021_CSAT.md#q22) — A survey was conducted on a sample of 500 cinema artists with reference to their proficiency in the skill of acting, singing and dancing. [Venn diagram describe
- [Prelims 2021 · CSAT Q23](../../past-papers/pre_2021_CSAT.md#q23) — Based on the information given below in diagram for Flight booking price scheme :
- [Prelims 2021 · CSAT Q24](../../past-papers/pre_2021_CSAT.md#q24) — Based on the information given below in diagram for Flight booking price scheme :
- [Prelims 2021 · CSAT Q54](../../past-papers/pre_2021_CSAT.md#q54) — Shakuntala, an intelligent baby girl, plucks apples from her father's orchard on ten consecutive days. When asked by her mother as to how many apples has she pl
- [Prelims 2021 · CSAT Q55](../../past-papers/pre_2021_CSAT.md#q55) — Shakuntala, an intelligent baby girl, plucks apples from her father's orchard on ten consecutive days. When asked by her mother as to how many apples has she pl
- [Prelims 2021 · CSAT Q56](../../past-papers/pre_2021_CSAT.md#q56) — The following table gives the career record in One-Day International Cricket of few batsmen (Matches played, Innings played, Runs scored, Average) : P1 — 50, 48
- [Prelims 2021 · CSAT Q57](../../past-papers/pre_2021_CSAT.md#q57) — The following table gives the career record in One-Day International Cricket of few batsmen (Matches played, Innings played, Runs scored, Average) : P1 — 50, 48
- [Prelims 2021 · CSAT Q58](../../past-papers/pre_2021_CSAT.md#q58) — The following table gives the career record in One-Day International Cricket of few batsmen (Matches played, Innings played, Runs scored, Average) : P1 — 50, 48
- [Prelims 2021 · CSAT Q59](../../past-papers/pre_2021_CSAT.md#q59) — Refer to the following line charts (values read approximately from the charts, for 17, 19, 20, 21 and 24 June) : Dollar/Rupee — 45.5, 46, 45.5, 46.2, 44.8; Poun
- [Prelims 2021 · CSAT Q60](../../past-papers/pre_2021_CSAT.md#q60) — Refer to the following line charts (values read approximately from the charts, for 17, 19, 20, 21 and 24 June) : Dollar/Rupee — 45.5, 46, 45.5, 46.2, 44.8; Poun
- [Prelims 2021 · CSAT Q61](../../past-papers/pre_2021_CSAT.md#q61) — [Pie charts described in words — Percentage-wise distribution of population of wild animals: A1 19%, A2 13%, A3 20%, A4 11%, A5 14%, A6 15%, A7 8%. Percentage-w
- [Prelims 2021 · CSAT Q62](../../past-papers/pre_2021_CSAT.md#q62) — [Pie charts described in words — Percentage-wise distribution of population of wild animals: A1 19%, A2 13%, A3 20%, A4 11%, A5 14%, A6 15%, A7 8%. Percentage-w

## Practice MCQs (20)

**1.** Hypothetical table, wheat output (lakh tonnes): District A: 10 in 2022, 12 in 2023; District B: 8 in 2022, 10 in 2023; District C: 12 in 2022, 10 in 2023. By what percentage did District A's output rise?

(a) 20%  
(b) 16.7%  
(c) 2%  
(d) 25%

<details><summary>Answer</summary>

**(a) 20%** — % change = (12 - 10)/10 x 100 = 20%. 16.7% is the trap from dividing by the new value (2/12); 2 is the absolute change in lakh tonnes, not a percentage.

</details>

**2.** Using the same table (A: 10 to 12, B: 8 to 10, C: 12 to 10), which district recorded the highest percentage growth?

(a) C  
(b) B  
(c) A  
(d) A and B equally

<details><summary>Answer</summary>

**(b) B** — A: 2/10 = 20%. B: 2/8 = 25%. C: -2/12 = -16.7% (a fall). A and B have the same absolute rise of 2, but B starts from a smaller base, so its percentage growth is higher.

</details>

**3.** In a pie chart of a hypothetical state budget of Rs 2,00,000 crore, education gets 18%. What is its central angle and amount?

(a) 18 degrees; Rs 36,000 crore  
(b) 64.8 degrees; Rs 36,000 crore  
(c) 72 degrees; Rs 36,000 crore  
(d) 64.8 degrees; Rs 18,000 crore

<details><summary>Answer</summary>

**(b) 64.8 degrees; Rs 36,000 crore** — Angle = 18 x 3.6 = 64.8 degrees (since 100% = 360 degrees). Amount = 18% of 2,00,000 = 36,000 crore. 72 degrees would be 20%.

</details>

**4.** A survey shows the unemployment rate in a district rose from 8% to 10%. Which statement is correct?

(a) It rose by 20 percentage points  
(b) It rose by 2%, which is also 2 percentage points  
(c) It rose by 2 percentage points, which is a 25% increase  
(d) It rose by 25 percentage points

<details><summary>Answer</summary>

**(c) It rose by 2 percentage points, which is a 25% increase** — The difference between two rates is measured in percentage points: 10 - 8 = 2 points. The relative increase is 2/8 x 100 = 25%. Mixing the two terms is a classic trap.

</details>

**5.** For the data 7, 3, 9, 3, 8, which ordering of the averages is correct?

(a) Mode < Median < Mean  
(b) Mode < Mean < Median  
(c) Median < Mode < Mean  
(d) Mean < Median < Mode

<details><summary>Answer</summary>

**(b) Mode < Mean < Median** — Sorted: 3, 3, 7, 8, 9. Mode = 3 (appears twice). Mean = 30/5 = 6. Median = middle (3rd) value = 7. So 3 < 6 < 7: Mode < Mean < Median.

</details>

**6.** In a spreadsheet, cell C2 contains =$B$1*A2. If this formula is copied to cell C3, what will C3 contain?

(a) =B2*A3  
(b) =$B$1*A3  
(c) =$B$1*A2  
(d) =$B$2*A3

<details><summary>Answer</summary>

**(b) =$B$1*A3** — $B$1 is an absolute reference (both column and row fixed), so it stays unchanged. A2 is relative; moving the formula one row down changes it to A3. Result: =$B$1*A3.

</details>

**7.** Hypothetical table — paddy procured (lakh tonnes): Sangrur 16 (2023-24), 18 (2024-25); Patiala 14, 14; Ludhiana 12, 15; Bathinda 8, 6. By what percentage did the total procurement of the four districts rise?

(a) 6%  
(b) 3%  
(c) 5.7%  
(d) 7.5%

<details><summary>Answer</summary>

**(a) 6%** — Totals: 2023-24 = 16 + 14 + 12 + 8 = 50; 2024-25 = 18 + 14 + 15 + 6 = 53. Change = 3 lakh tonnes. Percentage rise = 3 / 50 x 100 = 6%. The 5.7% trap divides by the new total (3/53); 3% confuses the absolute change with a percentage.

</details>

**8.** Using the same table (Sangrur 16 to 18, Patiala 14 to 14, Ludhiana 12 to 15, Bathinda 8 to 6), whose share in the four-district total rose by the most percentage points?

(a) Patiala  
(b) Ludhiana  
(c) Sangrur  
(d) Bathinda

<details><summary>Answer</summary>

**(b) Ludhiana** — Shares 2023-24 (total 50): Sangrur 32%, Patiala 28%, Ludhiana 24%, Bathinda 16%. Shares 2024-25 (total 53): Sangrur 33.96%, Patiala 26.42%, Ludhiana 28.30%, Bathinda 11.32%. Change: Sangrur +1.96, Patiala -1.58, Ludhiana +4.30, Bathinda -4.68 points. Ludhiana rose most. Note Patiala's share fell even though its quantity was unchanged, because the total grew.

</details>

**9.** Using the same table, consider the following statements: 1. Bathinda's procurement fell by 25%. 2. Ludhiana's growth rate was more than double the growth rate of the four-district total. Which of the statements given above is/are correct?

(a) 1 only  
(b) 2 only  
(c) Both 1 and 2  
(d) Neither 1 nor 2

<details><summary>Answer</summary>

**(c) Both 1 and 2** — Statement 1: (6 - 8) / 8 x 100 = -25%, a fall of 25% — correct. Statement 2: Ludhiana grew (15 - 12) / 12 = 25%; the total grew 6%; 25% is more than double 6% (12%) — correct. So both.

</details>

**10.** In a survey of 200 farmers, 120 grow wheat-paddy, 70 grow vegetables and 50 grow fodder crops; 30 grow both wheat-paddy and vegetables, 20 grow both wheat-paddy and fodder, 15 grow both vegetables and fodder, and 10 grow all three. How many farmers grow none of these?

(a) 15  
(b) 25  
(c) 5  
(d) 10

<details><summary>Answer</summary>

**(a) 15** — Three-set formula: n(at least one) = 120 + 70 + 50 - 30 - 20 - 15 + 10 = 240 - 65 + 10 = 185. None = 200 - 185 = 15. Check by regions: all three 10; wheat-paddy and vegetables only 20; wheat-paddy and fodder only 10; vegetables and fodder only 5; wheat-paddy only 80; vegetables only 35; fodder only 25 — these add to 185.

</details>

**11.** In a pie chart of a state's gross value added, services are 48%, industry 29% and agriculture 23%. If agriculture's value is Rs 1,38,000 crore, what are the value of services and the central angle of industry?

(a) Rs 3,00,000 crore; 108 degrees  
(b) Rs 2,76,000 crore; 104.4 degrees  
(c) Rs 2,88,000 crore; 29 degrees  
(d) Rs 2,88,000 crore; 104.4 degrees

<details><summary>Answer</summary>

**(d) Rs 2,88,000 crore; 104.4 degrees** — Total = 1,38,000 / 0.23 = Rs 6,00,000 crore. Services = 48% of 6,00,000 = Rs 2,88,000 crore. Industry angle = 29 x 3.6 = 104.4 degrees. 29 degrees confuses percent with degrees; 2,76,000 is 2 x 1,38,000; 108 degrees would be 30%.

</details>

**12.** A district's literacy rate rose from 64% in 2001 to 72% in 2011. What is the approximate compound annual growth rate of the literacy rate over the decade?

(a) About 0.8%  
(b) About 12.5%  
(c) About 1.2%  
(d) About 2.5%

<details><summary>Answer</summary>

**(c) About 1.2%** — Total growth = 72 / 64 = 1.125, i.e. 12.5% over 10 years (the 12.5% option is the decade figure, not the annual rate). Annual compound rate = 1.125^(1/10) - 1. Since 1.012^10 is about 1.127, the rate is about 1.2% a year. The simple average 12.5 / 10 = 1.25% slightly overstates it, as compounding always does. Note also that the rise is 8 percentage points but 12.5 percent.

</details>

**13.** Class A has 30 students with an average score of 60 and Class B has 20 students with an average of 70. Consider the following statements:  
1. The combined average of the two classes is 65.  
2. If 10 more students, whose average score is 64, join the combined group, the overall average will change.  
Which of the statements given above is/are correct?

(a) 1 only  
(b) 2 only  
(c) Both 1 and 2  
(d) Neither 1 nor 2

<details><summary>Answer</summary>

**(d) Neither 1 nor 2** — Statement 1 is wrong: 65 is the simple average of 60 and 70; the weighted average is (30 x 60 + 20 x 70) / 50 = 3,200 / 50 = 64. Statement 2 is wrong: adding 10 students who average 64 keeps the overall average at 64, since (3,200 + 640) / 60 = 64. So neither is correct.

</details>

**14.** In a spreadsheet, cells A1 to A5 contain 4, 8, (blank), the text NA, and 10. What value does =AVERAGE(A1:A5) return?

(a) 7.33  
(b) 4.4  
(c) 5.5  
(d) An error

<details><summary>Answer</summary>

**(a) 7.33** — AVERAGE ignores empty cells and text in a range, so it averages only the numbers 4, 8 and 10: (4 + 8 + 10) / 3 = 22 / 3 = 7.33. Dividing 22 by 5 (4.4) wrongly counts the blank and text cells; dividing by 4 (5.5) counts one of them. No error arises because text in a referenced range is skipped.

</details>

**15.** Hypothetical data — paddy area (thousand hectares) and yield (tonnes per hectare) in five districts:  
District P: 2024 area 200, yield 6.5; 2025 area 190, yield 6.0  
District Q: 2024 area 150, yield 7.0; 2025 area 160, yield 6.5  
District R: 2024 area 120, yield 6.0; 2025 area 110, yield 6.4  
District S: 2024 area 180, yield 6.8; 2025 area 175, yield 5.6  
District T: 2024 area 100, yield 6.2; 2025 area 120, yield 6.0  
By about what percentage did the total paddy production of the five districts fall from 2024 to 2025?

(a) About 3.3%  
(b) About 6.7%  
(c) About 5.4%  
(d) About 7.2%

<details><summary>Answer</summary>

**(b) About 6.7%** — Step 1: production = area × yield (thousand tonnes). 2024: 1,300 + 1,050 + 720 + 1,224 + 620 = 4,914. 2025: 1,140 + 1,040 + 704 + 980 + 720 = 4,584. Step 2: fall = 330 ÷ 4,914 × 100 ≈ 6.7%. Averaging the five district percentage changes instead gives a wrong figure. Answer: about 6.7%.

</details>

**16.** Hypothetical data — paddy area (thousand hectares) and yield (tonnes per hectare) in five districts:  
District P: 2024 area 200, yield 6.5; 2025 area 190, yield 6.0  
District Q: 2024 area 150, yield 7.0; 2025 area 160, yield 6.5  
District R: 2024 area 120, yield 6.0; 2025 area 110, yield 6.4  
District S: 2024 area 180, yield 6.8; 2025 area 175, yield 5.6  
District T: 2024 area 100, yield 6.2; 2025 area 120, yield 6.0  
Which district recorded the largest percentage fall in paddy production from 2024 to 2025?

(a) P  
(b) Q  
(c) R  
(d) S

<details><summary>Answer</summary>

**(d) S** — Step 1: production (thousand tonnes) 2024 → 2025: P 1,300 → 1,140 (−12.3%); Q 1,050 → 1,040 (−1.0%); R 720 → 704 (−2.2%); S 1,224 → 980 (−19.9%); T 620 → 720 (+16.1%). Step 2: S has the largest fall, though P loses more area. Answer: S.

</details>

**17.** Hypothetical data — paddy area (thousand hectares) and yield (tonnes per hectare) in five districts:  
District P: 2024 area 200, yield 6.5; 2025 area 190, yield 6.0  
District Q: 2024 area 150, yield 7.0; 2025 area 160, yield 6.5  
District R: 2024 area 120, yield 6.0; 2025 area 110, yield 6.4  
District S: 2024 area 180, yield 6.8; 2025 area 175, yield 5.6  
District T: 2024 area 100, yield 6.2; 2025 area 120, yield 6.0  
Consider the following statements:  
1. District T's production rose in 2025 even though its yield fell.  
2. In 2025 the combined yield of the five districts (total production ÷ total area) was above 6.2 tonnes per hectare.  
Which of the statements given above is/are correct?

(a) 1 only  
(b) 2 only  
(c) Both 1 and 2  
(d) Neither 1 nor 2

<details><summary>Answer</summary>

**(a) 1 only** — T's production rose from 620 to 720 thousand tonnes because its area grew from 100 to 120 thousand ha while its yield slipped from 6.2 to 6.0 — the first statement is right. The 2025 combined yield = 4,584 ÷ 755 ≈ 6.07 t/ha, which is below 6.2, so the second is wrong (even the simple average of the five 2025 yields is only 6.1). Answer: 1 only.

</details>

**18.** Hypothetical data — expenditure of a municipal council (Rs lakh):  
Sanitation: 2022-23: 240; 2023-24: 270; 2024-25: 300; 2025-26: 330  
Water supply: 180; 200; 210; 250  
Roads: 300; 260; 320; 280  
Street lights: 80; 90; 100; 110  
In which year was the share of sanitation in the council's total expenditure the highest?

(a) 2024-25  
(b) 2022-23  
(c) 2023-24  
(d) 2025-26

<details><summary>Answer</summary>

**(d) 2025-26** — Step 1: totals are 800, 820, 930 and 970. Step 2: sanitation shares = 240/800 = 30.0%, 270/820 ≈ 32.9%, 300/930 ≈ 32.3%, 330/970 ≈ 34.0%. The share dipped in 2024-25 because roads spending jumped, but 2025-26 is highest. Answer: 2025-26.

</details>

**19.** Hypothetical data — expenditure of a municipal council (Rs lakh):  
Sanitation: 2022-23: 240; 2023-24: 270; 2024-25: 300; 2025-26: 330  
Water supply: 180; 200; 210; 250  
Roads: 300; 260; 320; 280  
Street lights: 80; 90; 100; 110  
Water-supply spending in 2025-26 was about what percent more than its average over the previous three years?

(a) About 39%  
(b) About 25%  
(c) About 27%  
(d) About 19%

<details><summary>Answer</summary>

**(c) About 27%** — Step 1: average of 2022-23 to 2024-25 = (180 + 200 + 210) ÷ 3 = 590 ÷ 3 ≈ 196.7. Step 2: (250 − 196.7) ÷ 196.7 × 100 ≈ 27.1%. The other options compare with a single year: 180 (≈ 39%), 200 (25%) or 210 (≈ 19%). Answer: about 27%.

</details>

**20.** Hypothetical data — expenditure of a municipal council (Rs lakh):  
Sanitation: 2022-23: 240; 2023-24: 270; 2024-25: 300; 2025-26: 330  
Water supply: 180; 200; 210; 250  
Roads: 300; 260; 320; 280  
Street lights: 80; 90; 100; 110  
Consider the following statements:  
1. Spending on roads in 2025-26 was above its four-year average.  
2. Total expenditure grew by more than 2.5% in every year over the previous year.  
Which of the statements given above is/are correct?

(a) 1 only  
(b) 2 only  
(c) Both 1 and 2  
(d) Neither 1 nor 2

<details><summary>Answer</summary>

**(d) Neither 1 nor 2** — The four-year average for roads is (300 + 260 + 320 + 280) ÷ 4 = 290, and 2025-26 spending of 280 is below it, so the first statement is wrong. Totals grew 800 → 820 → 930 → 970, i.e. by exactly 2.5%, then about 13.4% and 4.3%; the first year's growth is not 'more than' 2.5%, so the second is also wrong. Answer: Neither.

</details>

---
*Generated from PCS Prep. Changeable facts are as of the date shown in the app. Report mistakes in the repository's Issues.*
