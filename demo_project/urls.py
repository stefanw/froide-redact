from django.conf.urls import url

from froide_redact.views import redact


urlpatterns = [
    url(r'^$', redact, name='froide_redact-redact'),
]
