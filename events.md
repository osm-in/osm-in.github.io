---
layout: page
title: Events
permalink: /events/

---

  {% for event in site.posts %}
  <article class="event">
    <h3 class="event-headline">
      <a href="{{ event.url }}">{{ event.title }}</a>
    </h3>
    <span class="event-meta"> on <time>{{ event.event_date }}</time> at {{event.event_venue}} </span>

    <p class="event-description">{{ event.excerpt }}</p>
  </article>
  {% endfor %}

