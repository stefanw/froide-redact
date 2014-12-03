from django.conf.urls import patterns


urlpatterns = patterns("froide_redact.views",
    (r'^(?P<article_id>\d+)/$', 'show', {}, 'foiidea-show'),
)
