"""
Workflow Template Service
Predefined workflow templates for common use cases
"""

from typing import Dict, Any, List, Optional


class TemplateService:
    """Provide workflow templates"""
    
    TEMPLATES = [
        {
            "id": "morning-digest",
            "name": "Morning Digest",
            "description": "Daily summary of important emails at 9 AM",
            "icon": "☀️",
            "category": "productivity",
            "trigger_type": "schedule",
            "trigger_config": {"cron": "0 9 * * *", "frequency": "daily"},
            "actions": [
                {"type": "fetch_emails", "config": {"filter": "unread", "time_range": "24h"}},
                {"type": "summarize", "config": {"model": "gpt-3.5-turbo", "max_length": 300}},
                {"type": "send_digest", "config": {"destination": "email", "format": "markdown"}}
            ],
            "popular": True,
            "usage_count": 1240
        },
        {
            "id": "urgent-alert",
            "name": "Urgent Alert",
            "description": "Instant notification for high-priority emails",
            "icon": "🚨",
            "category": "notification",
            "trigger_type": "email_received",
            "trigger_config": {"conditions": [{"field": "priority", "operator": "equals", "value": "urgent"}]},
            "actions": [
                {"type": "mark_priority", "config": {"priority": "high"}},
                {"type": "send_digest", "config": {"destination": "push", "format": "short"}}
            ],
            "popular": True,
            "usage_count": 856
        },
        {
            "id": "weekly-report",
            "name": "Weekly Report",
            "description": "Compile weekly work summary every Friday",
            "icon": "📊",
            "category": "productivity",
            "trigger_type": "schedule",
            "trigger_config": {"cron": "0 18 * * 5", "frequency": "weekly"},
            "actions": [
                {"type": "fetch_emails", "config": {"filter": "all", "time_range": "7d"}},
                {"type": "summarize", "config": {"model": "gpt-3.5-turbo", "max_length": 500}},
                {"type": "create_task", "config": {"platform": "default"}},
                {"type": "send_digest", "config": {"destination": "email", "format": "detailed"}}
            ],
            "popular": False,
            "usage_count": 432
        },
        {
            "id": "auto-reply",
            "name": "Auto Reply",
            "description": "Automatic response when out of office",
            "icon": "✈️",
            "category": "automation",
            "trigger_type": "email_received",
            "trigger_config": {"conditions": [{"field": "time", "operator": "outside_work_hours"}]},
            "actions": [
                {"type": "send_digest", "config": {"destination": "reply", "template": "out_of_office"}}
            ],
            "popular": False,
            "usage_count": 321
        },
        {
            "id": "client-followup",
            "name": "Client Follow-up",
            "description": "Remind to follow up with clients after 3 days",
            "icon": "🤝",
            "category": "crm",
            "trigger_type": "email_received",
            "trigger_config": {"conditions": [{"field": "sender", "operator": "contains", "value": "client"}]},
            "actions": [
                {"type": "create_task", "config": {"platform": "default", "due_in": "3d"}},
                {"type": "mark_priority", "config": {"priority": "medium"}}
            ],
            "popular": True,
            "usage_count": 678
        },
        {
            "id": "invoice-tracker",
            "name": "Invoice Tracker",
            "description": "Auto-process and track invoice emails",
            "icon": "💰",
            "category": "finance",
            "trigger_type": "email_received",
            "trigger_config": {"conditions": [{"field": "subject", "operator": "contains", "value": "invoice"}]},
            "actions": [
                {"type": "mark_priority", "config": {"priority": "high"}},
                {"type": "forward", "config": {"target": "finance@company.com"}},
                {"type": "create_task", "config": {"platform": "default", "title": "Process Invoice"}}
            ],
            "popular": False,
            "usage_count": 245
        },
        {
            "id": "meeting-prep",
            "name": "Meeting Prep",
            "description": "Prepare meeting summary 30 mins before",
            "icon": "📅",
            "category": "productivity",
            "trigger_type": "schedule",
            "trigger_config": {"cron": "30 * * * *", "frequency": "hourly"},
            "actions": [
                {"type": "fetch_emails", "config": {"filter": "calendar", "time_range": "1h"}},
                {"type": "summarize", "config": {"model": "gpt-3.5-turbo"}},
                {"type": "send_digest", "config": {"destination": "push"}}
            ],
            "popular": False,
            "usage_count": 189
        },
        {
            "id": "newsletter-digest",
            "name": "Newsletter Digest",
            "description": "Weekly summary of newsletters",
            "icon": "📰",
            "category": "productivity",
            "trigger_type": "schedule",
            "trigger_config": {"cron": "0 10 * * 0", "frequency": "weekly"},
            "actions": [
                {"type": "fetch_emails", "config": {"filter": "newsletter", "time_range": "7d"}},
                {"type": "summarize", "config": {"model": "gpt-3.5-turbo", "max_length": 400}},
                {"type": "send_digest", "config": {"destination": "email"}}
            ],
            "popular": False,
            "usage_count": 156
        }
    ]
    
    def get_all_templates(self) -> List[Dict[str, Any]]:
        """Get all available templates"""
        return self.TEMPLATES
    
    def get_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific template by ID"""
        for template in self.TEMPLATES:
            if template["id"] == template_id:
                return template
        return None
    
    def get_templates_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get templates filtered by category"""
        return [t for t in self.TEMPLATES if t["category"] == category]
    
    def get_popular_templates(self, limit: int = 4) -> List[Dict[str, Any]]:
        """Get most popular templates"""
        sorted_templates = sorted(self.TEMPLATES, key=lambda x: x["usage_count"], reverse=True)
        return sorted_templates[:limit]
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """Get all categories with counts"""
        categories = {}
        for template in self.TEMPLATES:
            cat = template["category"]
            if cat not in categories:
                categories[cat] = {"name": cat.capitalize(), "count": 0}
            categories[cat]["count"] += 1
        return list(categories.values())


# Example usage
if __name__ == "__main__":
    service = TemplateService()
    
    print("All Templates:")
    for t in service.get_all_templates():
        print(f"  {t['icon']} {t['name']} ({t['usage_count']} users)")
    
    print("\nPopular Templates:")
    for t in service.get_popular_templates():
        print(f"  {t['icon']} {t['name']}")
