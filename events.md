---
layout: default
title: About
---

# Events
<ul>
  {% for event in site.posts %}
    <li>
      <h2><a href="{{ event.url }}">{{ event.title }}</a></h2> on {{ event.event_date }} at {{event.event_venue}}<br>
      {{ event.excerpt }}
    </li>
  {% endfor %}
</ul>
