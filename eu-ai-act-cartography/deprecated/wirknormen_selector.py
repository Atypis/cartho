#!/usr/bin/env python3
# DEPRECATED: Moved to eu-ai-act-cartography/deprecated on 2025-10-10. Use Prescriptive Norms JSON and new evaluation engines instead.
"""
EU AI Act Wirknormen Selector
Interactive tool to identify which legal obligations apply to a specific AI system
"""

import json
import os
from typing import Dict, List, Set, Any, Optional


class WirknormenSelector:
    """Interactive selector for identifying applicable Wirknormen based on system characteristics"""

    def __init__(self, catalog_path: str, annex_iii_path: str):
        """Load catalogs from JSON files"""
        with open(catalog_path, 'r') as f:
            self.catalog = json.load(f)

        with open(annex_iii_path, 'r') as f:
            self.annex_iii = json.load(f)

        self.answers = {}
        self.applicable_wirknormen = set()
        self.shared_requirements = self.catalog['shared_requirements_library']
        self.wirknormen = self.catalog['wirknormen']

    def evaluate_requirement(self, req: Any) -> Optional[bool]:
        """
        Recursively evaluate a requirement or condition structure
        Returns True if requirement is met, False if not, None if cannot determine yet
        """
        # If requirement is a reference to shared requirement
        if isinstance(req, dict) and 'ref' in req:
            ref_id = req['ref']
            return self.answers.get(ref_id)

        # If requirement has a question (leaf node)
        if isinstance(req, dict) and 'question' in req:
            # Check if we already have an answer
            req_id = req.get('id') or req.get('description')
            return self.answers.get(req_id)

        # If requirement has operator (composite requirement)
        if isinstance(req, dict) and 'operator' in req:
            operator = req['operator']
            conditions = req.get('conditions', [])

            if not conditions:
                return None

            # Evaluate all child conditions
            child_results = [self.evaluate_requirement(cond) for cond in conditions]

            # Handle different operators
            if operator == 'AND':
                # All must be True; if any False, return False; if any None, return None
                if False in child_results:
                    return False
                if None in child_results:
                    return None
                return True

            elif operator == 'OR':
                # Any True makes it True; all False makes it False; otherwise None
                if True in child_results:
                    return True
                if all(r == False for r in child_results):
                    return False
                return None

            elif operator == 'AND_NOT':
                # Negation: if child is True, this is False; if child is False, this is True
                if len(child_results) == 1:
                    if child_results[0] == True:
                        return False
                    elif child_results[0] == False:
                        return True
                    return None
                # For multiple conditions, evaluate as negation of AND
                and_result = self.evaluate_requirement({'operator': 'AND', 'conditions': conditions})
                if and_result is None:
                    return None
                return not and_result

        # If requirement is a description (simple condition)
        if isinstance(req, dict) and 'description' in req:
            req_id = req.get('id') or req['description']
            return self.answers.get(req_id)

        return None

    def ask_question(self, question: str, req_id: str) -> bool:
        """Ask user a yes/no question and store answer"""
        while True:
            answer = input(f"\n{question}\n[y/n]: ").strip().lower()
            if answer in ['y', 'yes']:
                self.answers[req_id] = True
                return True
            elif answer in ['n', 'no']:
                self.answers[req_id] = False
                return False
            else:
                print("Please answer 'y' or 'n'")

    def collect_shared_requirement_answers(self):
        """Ask questions for all shared requirements"""
        print("\n" + "="*80)
        print("SHARED REQUIREMENTS - Answer these questions about your AI system")
        print("="*80)

        # Ask fundamental questions first
        for req_id in ['SR-001', 'SR-002', 'SR-003', 'SR-006', 'SR-007', 'SR-008', 'SR-009']:
            if req_id in self.shared_requirements:
                req = self.shared_requirements[req_id]
                question = req.get('question', req['description'])
                self.ask_question(f"{req['name']}: {question}", req_id)

        # If provider or deployer, ask about high-risk classification
        if self.answers.get('SR-002') or self.answers.get('SR-003'):
            print("\n--- HIGH-RISK CLASSIFICATION ---")
            self.determine_high_risk_status()

        # If general-purpose AI model provider, ask about systemic risk
        if self.answers.get('SR-006'):
            print("\n--- SYSTEMIC RISK CLASSIFICATION ---")
            self.determine_systemic_risk_status()

    def determine_high_risk_status(self):
        """Determine if system is high-risk via Article 6 pathways"""
        print("\nDetermining if your AI system is classified as high-risk...")

        # Pathway 1: Product safety (Article 6(1))
        print("\n1. Product Safety Pathway (Article 6(1)):")
        is_safety_component = self.ask_question(
            "Is the system a safety component of a product covered by Annex I EU harmonisation legislation?",
            "SR-004a"
        )

        if is_safety_component:
            requires_third_party = self.ask_question(
                "Does the product require third-party conformity assessment?",
                "SR-004a-third-party"
            )
            if requires_third_party:
                self.answers['SR-004'] = True
                print("\n✓ System is HIGH-RISK via Article 6(1) product safety pathway")
                return

        # Pathway 2: Annex III use cases (Article 6(2))
        print("\n2. Annex III Use Cases Pathway (Article 6(2)):")
        matches_annex_iii = self.check_annex_iii_use_cases()

        if matches_annex_iii:
            # Check for Article 6(3) opt-out
            print("\n--- Article 6(3) Opt-Out Check ---")
            print("Providers MAY conclude a system is NOT high-risk if it performs:")
            print("• Narrow procedural task")
            print("• Improvement of prior human activity")
            print("• Pattern detection without influence")
            print("• Preparatory task")
            print("BUT: Profiling ALWAYS makes system high-risk!")

            performs_profiling = self.ask_question(
                "Does the system perform profiling of natural persons?",
                "SR-004b-profiling"
            )

            if performs_profiling:
                self.answers['SR-004'] = True
                print("\n✓ System is HIGH-RISK (profiling override)")
                return

            opts_out = self.ask_question(
                "Has the provider concluded the system is NOT high-risk per Article 6(3)?",
                "SR-004b-opt-out"
            )

            if not opts_out:
                self.answers['SR-004'] = True
                print("\n✓ System is HIGH-RISK via Annex III pathway")
                return
            else:
                print("\n→ Provider claims Article 6(3) opt-out (must register + justify)")
                self.answers['SR-004'] = False
                return

        self.answers['SR-004'] = False
        print("\n→ System is NOT high-risk")

    def check_annex_iii_use_cases(self) -> bool:
        """Check if system matches any Annex III high-risk use case"""
        print("\nChecking against 8 Annex III high-risk areas:")

        for area_num, area_data in self.annex_iii['areas'].items():
            area_name = area_data['area_name']
            print(f"\n{area_num}. {area_name}")

            matches_area = self.ask_question(
                f"Does your system fall under {area_name}?",
                f"ANNEX-III-{area_num}"
            )

            if matches_area:
                # Show specific use cases
                use_cases = area_data['use_cases']
                for uc_id, uc_data in use_cases.items():
                    uc_full_id = uc_data['id']
                    description = uc_data['description']

                    matches_use_case = self.ask_question(
                        f"Specifically: {description}?",
                        uc_full_id
                    )

                    if matches_use_case:
                        self.answers['SR-004b-1'] = True
                        print(f"\n✓ Matches {uc_full_id}")

                        # Note special registration if applicable
                        if 'special_registration' in uc_data:
                            print(f"  Note: {uc_data['special_registration']}")

                        return True

        return False

    def determine_systemic_risk_status(self):
        """Determine if general-purpose AI model has systemic risk"""
        print("\nDetermining if model has systemic risk...")

        # Check FLOPs threshold
        high_flops = self.ask_question(
            "Does the model have cumulative training computation > 10^25 FLOPs?",
            "SR-010a"
        )

        if high_flops:
            self.answers['SR-010'] = True
            print("\n✓ Model presumed to have SYSTEMIC RISK (>10^25 FLOPs)")

            # Note: Provider can argue against classification per Article 52(2)
            print("  Note: Provider may present arguments against classification (Article 52(2))")
            return

        # Check Commission decision
        commission_decision = self.ask_question(
            "Has the Commission designated this model as systemic risk (ex officio or scientific panel alert)?",
            "SR-010b"
        )

        if commission_decision:
            self.answers['SR-010'] = True
            print("\n✓ Model has SYSTEMIC RISK (Commission decision)")
        else:
            self.answers['SR-010'] = False
            print("\n→ Model does NOT have systemic risk")

    def check_wirknorm_applicability(self, wirknorm_id: str) -> bool:
        """Check if a specific Wirknorm applies based on current answers"""
        wirknorm = self.wirknormen.get(wirknorm_id)
        if not wirknorm:
            return False

        requirements = wirknorm.get('requirements')
        if not requirements:
            return False

        result = self.evaluate_requirement(requirements)
        return result == True

    def determine_applicable_wirknormen(self):
        """Determine which Wirknormen apply based on answers"""
        print("\n" + "="*80)
        print("DETERMINING APPLICABLE WIRKNORMEN")
        print("="*80)

        self.applicable_wirknormen = set()

        for wirknorm_id, wirknorm in self.wirknormen.items():
            if self.check_wirknorm_applicability(wirknorm_id):
                self.applicable_wirknormen.add(wirknorm_id)

        return self.applicable_wirknormen

    def display_results(self):
        """Display all applicable Wirknormen with details"""
        print("\n" + "="*80)
        print(f"RESULTS: {len(self.applicable_wirknormen)} WIRKNORMEN APPLY TO YOUR AI SYSTEM")
        print("="*80)

        if not self.applicable_wirknormen:
            print("\n✓ No specific Wirknormen apply (beyond general AI literacy W-001)")
            return

        # Group by category
        categories = {
            'Prohibitions': [],
            'High-Risk Technical Requirements': [],
            'Provider Obligations': [],
            'Deployer Obligations': [],
            'General-Purpose AI': [],
            'Registration': [],
            'Transparency': [],
            'Testing': [],
            'Post-Market': [],
            'Other': []
        }

        for w_id in sorted(self.applicable_wirknormen):
            wirknorm = self.wirknormen[w_id]
            name = wirknorm['name']

            # Categorize
            if 'Prohibition' in name:
                categories['Prohibitions'].append((w_id, wirknorm))
            elif 'General-Purpose' in name or 'Systemic Risk' in name:
                categories['General-Purpose AI'].append((w_id, wirknorm))
            elif 'Registration' in name:
                categories['Registration'].append((w_id, wirknorm))
            elif 'Transparency' in name or 'Explanation' in name:
                categories['Transparency'].append((w_id, wirknorm))
            elif 'Testing' in name:
                categories['Testing'].append((w_id, wirknorm))
            elif 'Post-Market' in name or 'Incident' in name:
                categories['Post-Market'].append((w_id, wirknorm))
            elif 'Deployer' in name:
                categories['Deployer Obligations'].append((w_id, wirknorm))
            elif 'Provider' in name or wirknorm['type'] == 'Technical Requirement':
                if w_id.startswith('W-00') and int(w_id.split('-')[1]) <= 13:
                    categories['High-Risk Technical Requirements'].append((w_id, wirknorm))
                else:
                    categories['Provider Obligations'].append((w_id, wirknorm))
            else:
                categories['Other'].append((w_id, wirknorm))

        # Display each category
        for category, wirknormen_list in categories.items():
            if wirknormen_list:
                print(f"\n{'='*80}")
                print(f"{category.upper()} ({len(wirknormen_list)})")
                print('='*80)

                for w_id, wirknorm in wirknormen_list:
                    print(f"\n{w_id}: {wirknorm['name']}")
                    print(f"  Article: {wirknorm['article']}")
                    print(f"  Type: {wirknorm['type']}")
                    print(f"  Actors: {', '.join(wirknorm['actors'])}")
                    print(f"  Consequence: {wirknorm['consequence']}")
                    print(f"  Penalty: {wirknorm.get('penalty_tier', 'N/A')}")
                    print(f"  Applicable from: {wirknorm.get('applicable_from', 'N/A')}")

                    # Show obligations if umbrella Wirknorm
                    if 'obligations' in wirknorm and isinstance(wirknorm['obligations'], list):
                        if len(wirknorm['obligations']) <= 5:
                            print(f"  Obligations:")
                            for obl in wirknorm['obligations']:
                                if isinstance(obl, dict):
                                    print(f"    • {obl.get('description', obl)}")
                                else:
                                    print(f"    • {obl}")
                        else:
                            print(f"  Obligations: {len(wirknorm['obligations'])} total (see catalog for details)")

    def save_report(self, filename: str = "wirknormen_report.json"):
        """Save results to JSON file"""
        report = {
            'answers': self.answers,
            'applicable_wirknormen': list(self.applicable_wirknormen),
            'wirknormen_details': {
                w_id: self.wirknormen[w_id]
                for w_id in self.applicable_wirknormen
            }
        }

        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n✓ Report saved to {filename}")

    def run_interactive_session(self):
        """Run full interactive session"""
        print("\n" + "="*80)
        print("EU AI ACT WIRKNORMEN SELECTOR")
        print("Interactive tool to identify your legal obligations")
        print("="*80)
        print("\nThis tool will ask you questions about your AI system to determine")
        print("which legal obligations (Wirknormen) from the EU AI Act apply to you.")
        print("\nAnswer each question with 'y' (yes) or 'n' (no).")

        # Collect answers
        self.collect_shared_requirement_answers()

        # Determine applicable Wirknormen
        self.determine_applicable_wirknormen()

        # Display results
        self.display_results()

        # Offer to save report
        print("\n" + "="*80)
        save = input("\nWould you like to save this report to a file? [y/n]: ").strip().lower()
        if save in ['y', 'yes']:
            filename = input("Enter filename (default: wirknormen_report.json): ").strip()
            if not filename:
                filename = "wirknormen_report.json"
            self.save_report(filename)

        print("\n" + "="*80)
        print("SESSION COMPLETE")
        print("="*80)


def main():
    """Main entry point"""
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    catalog_path = os.path.join(script_dir, 'wirknormen-catalog', 'wirknormen-complete-catalog.json')
    annex_iii_path = os.path.join(script_dir, 'wirknormen-catalog', 'annex-iii-high-risk-use-cases.json')

    # Check files exist
    if not os.path.exists(catalog_path):
        print(f"Error: Catalog not found at {catalog_path}")
        return

    if not os.path.exists(annex_iii_path):
        print(f"Error: Annex III catalog not found at {annex_iii_path}")
        return

    # Run selector
    selector = WirknormenSelector(catalog_path, annex_iii_path)
    selector.run_interactive_session()


if __name__ == '__main__':
    main()
