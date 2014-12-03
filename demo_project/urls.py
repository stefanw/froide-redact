from django.conf.urls import patterns, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'froide_redact.views.redact', name='froide_redact-redact'),
)
