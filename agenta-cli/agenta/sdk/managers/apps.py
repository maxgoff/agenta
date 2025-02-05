import logging

from agenta.sdk.utils.exceptions import handle_exceptions

import agenta as ag


logger = logging.getLogger(__name__)


class AppManager:
    @classmethod
    @handle_exceptions()
    def create(cls, *, app_slug: str, template_key: str):
        app_response = ag.api.apps.create_app(
            app_name=app_slug, template_key=template_key
        )
        return app_response

    @classmethod
    @handle_exceptions()
    async def acreate(cls, *, app_slug: str, template_key: str):
        app_response = await ag.async_api.apps.create_app(
            app_name=app_slug, template_key=template_key
        )
        return app_response

    @classmethod
    @handle_exceptions()
    def list(cls):
        apps_response = ag.api.apps.list_apps()
        return apps_response

    @classmethod
    @handle_exceptions()
    async def alist(cls):
        apps_response = await ag.async_api.apps.list_apps()
        return apps_response

    @classmethod
    @handle_exceptions()
    def update(cls, *, app_id: str, app_slug: str):
        app_response = ag.api.apps.update_app(app_id=app_id, app_name=app_slug)
        return app_response

    @classmethod
    @handle_exceptions()
    async def aupdate(cls, *, app_id: str, app_slug: str):
        app_response = await ag.async_api.apps.update_app(
            app_id=app_id, app_name=app_slug
        )
        return app_response

    @classmethod
    @handle_exceptions()
    def delete(cls, *, app_id: str):
        ag.api.apps.remove_app(app_id=app_id)
        return None

    @classmethod
    @handle_exceptions()
    async def adelete(cls, *, app_id: str):
        await ag.async_api.apps.remove_app(app_id=app_id)
        return None
