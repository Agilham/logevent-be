from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def admin_test(self):
        self.client.get("/admins/read")

    @task
    def album_test(self):
        self.client.get("/albums/read")

    @task
    def auth_test(self):
        self.client.get("/auth/read")

    @task
    def bundle_test(self):
        self.client.get("/bundles/read")

    @task
    def cart_test(self):
        self.client.get("/carts/read")

    @task
    def category_test(self):
        self.client.get("/categories/read")

    @task
    def city_test(self):
        self.client.get("/cities/read")

    @task
    def event_test(self):
        self.client.get("/events/read")

    @task
    def faq_test(self):
        self.client.get("/faqs/read")

    @task
    def order_test(self):
        self.client.get("/orders/read")

    @task
    def product_test(self):
        self.client.get("/products/read")

    @task
    def review_test(self):
        self.client.get("/reviews/read")

    @task
    def setting_test(self):
        self.client.get("/settings/read")

    @task
    def vendor_test(self):
        self.client.get("/vendors/read")

    @task
    def visit_test(self):
        self.client.get("/visits/read")
