import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Address, Category, Brand, Product, ProductImage, Coupon, Review, Order, OrderItem, Payment
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Verificar se já existem dados
        if db.query(User).filter(User.email == "admin@aurumparfums.com").first():
            print("=> Banco de dados já semeado.")
            return

        print("=> Semeando banco de dados com catálogo de luxo...")

        # 1. Usuários de Demonstração
        admin_user = User(
            name="Administrador Aurum",
            email="admin@aurumparfums.com",
            password_hash=get_password_hash("admin123"),
            role="ADMIN",
            phone="(11) 99999-8888"
        )

        customer_user = User(
            name="Gabriel Alencar",
            email="cliente@aurumparfums.com",
            password_hash=get_password_hash("cliente123"),
            role="USER",
            phone="(11) 97777-6666"
        )

        db.add(admin_user)
        db.add(customer_user)
        db.flush()

        # Endereço do cliente
        addr = Address(
            user_id=customer_user.id,
            zip_code="01415-000",
            street="Alameda Santos",
            number="1470",
            complement="Apto 121",
            neighborhood="Jardins",
            city="São Paulo",
            state="SP",
            is_default=True
        )
        db.add(addr)

        # 2. Categorias
        cat_oriental = Category(name="Oriental & Especiarias", slug="oriental-especiarias", description="Fragrâncias marcantes e envolventes com baunilha, âmbar e especiarias exóticas.", image_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80")
        cat_amadeirado = Category(name="Amadeirados Nobres", slug="amadeirados-nobres", description="Acordes ricos de oud, sândalo, cedro e vetiver de Madagascar.", image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80")
        cat_floral = Category(name="Florais Raros", slug="florais-raros", description="Extratos de rosas de Grasse, jasmim da Tailândia e íris nobre.", image_url="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80")
        cat_citrico = Category(name="Cítricos Luxuosos", slug="citricos-luxuosos", description="Frescor efervescente de bergamota da Calábria e neroli de Tânger.", image_url="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=600&q=80")
        cat_niche = Category(name="Extrait de Parfum Niche", slug="extrait-de-parfum-niche", description="Concentrações puras e exclusivas para apreciadores da alta perfumaria.", image_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80")

        db.add_all([cat_oriental, cat_amadeirado, cat_floral, cat_citrico, cat_niche])
        db.flush()

        # 3. Marcas
        b_aurum = Brand(name="Aurum Privé", slug="aurum-prive", description="A mais alta expressão da perfumaria autoral de luxo.", logo_url="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=200&q=80")
        b_creed = Brand(name="Creed Heritage", slug="creed-heritage", description="Tradição secular criando fragrâncias épicas para reis e aristocratas.", logo_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80")
        b_tomford = Brand(name="Tom Ford Private Blend", slug="tom-ford-private-blend", description="Sedução contemporânea e matérias-primas raras em frascos icônicos.", logo_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80")
        b_mfk = Brand(name="Maison Francis Kurkdjian", slug="maison-francis-kurkdjian", description="Genialidade parisiense e elegância cristalina refinada.", logo_url="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=200&q=80")
        b_marly = Brand(name="Parfums de Marly", slug="parfums-de-marly", description="O esplendor do Século XVIII francês renovado com majestade.", logo_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80")

        db.add_all([b_aurum, b_creed, b_tomford, b_mfk, b_marly])
        db.flush()

        # 4. Produtos (Perfumes de Alta Perfumaria)
        products_data = [
            {
                "name": "Aurum Imperial Oud Extrait",
                "slug": "aurum-imperial-oud-extrait",
                "brand_id": b_aurum.id,
                "category_id": cat_niche.id,
                "gender": "unissex",
                "description": "Uma obra-prima magnifica que combina Oud Cambojano envelhecido por 20 anos, raspas de açafrão dourado e infusão de baunilha bourbon de Madagascar. Um aroma suntuoso para personalidades marcantes.",
                "volume_ml": 100,
                "concentration": "Extrait de Parfum",
                "olfactory_family": "Amadeirado Oriental",
                "top_notes": "Açafrão Real, Cardamomo da Índia, Pimenta Rosa",
                "heart_notes": "Oud Cambojano, Rosa de Taif, Incenso de Omã",
                "base_notes": "Sândalo Mysore, Âmbar Cinzento, Baunilha Bourbon",
                "price": 1890.00,
                "promotional_price": 1690.00,
                "discount_percent": 10,
                "stock": 8,
                "sku": "AUR-OUD-001",
                "status": "active",
                "featured": True,
                "release": True,
                "bestseller": True,
                "images": [
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Creed Aventus Sovereign",
                "slug": "creed-aventus-sovereign",
                "brand_id": b_creed.id,
                "category_id": cat_amadeirado.id,
                "gender": "masculino",
                "description": "Celebrando força e sucesso, traz notas vibrantes de abacaxi preto, bergamota italiana, vidoeiro defumado e musgo de carvalho. O perfume definitivo do homem moderno poderoso.",
                "volume_ml": 100,
                "concentration": "Eau de Parfum",
                "olfactory_family": "Amadeirado Frutado",
                "top_notes": "Abacaxi Real, Bergamota da Calábria, Maçã Verde",
                "heart_notes": "Vidoeiro Defumado, Patchouli de Singapura, Jasmim Marroquino",
                "base_notes": "Musgo de Carvalho, Âmbar Cinzento, Baunilha",
                "price": 2450.00,
                "promotional_price": None,
                "discount_percent": 0,
                "stock": 12,
                "sku": "CRD-AVE-002",
                "status": "active",
                "featured": True,
                "release": False,
                "bestseller": True,
                "images": [
                    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Baccarat Rouge 540 Elixir",
                "slug": "baccarat-rouge-540-elixir",
                "brand_id": b_mfk.id,
                "category_id": cat_oriental.id,
                "gender": "unissex",
                "description": "Uma fragrância alquímica e poética onde as notas de jasmim luminoso e o brilho do açafrão carregam as facetas minerais do âmbar cinzento e os tons amadeirados do cedro cortado.",
                "volume_ml": 70,
                "concentration": "Extrait de Parfum",
                "olfactory_family": "Oriental Ambarado",
                "top_notes": "Açafrão do Irã, Jasmim Grandiflorum do Egito",
                "heart_notes": "Madeira de Âmbar, Âmbar Cinzento",
                "base_notes": "Resina de Abeto, Cedro da Virgínia",
                "price": 2890.00,
                "promotional_price": 2590.00,
                "discount_percent": 10,
                "stock": 5,
                "sku": "MFK-BAC-003",
                "status": "active",
                "featured": True,
                "release": True,
                "bestseller": True,
                "images": [
                    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Tom Ford Tobacco Vanille Reserve",
                "slug": "tom-ford-tobacco-vanille-reserve",
                "brand_id": b_tomford.id,
                "category_id": cat_oriental.id,
                "gender": "unissex",
                "description": "Opulento, quente e icônico. Remete aos clubes de membros ingleses através de suntuosas essências de folha de tabaco aromatizada com especiarias e suave cacau de feijão tonka.",
                "volume_ml": 100,
                "concentration": "Eau de Parfum",
                "olfactory_family": "Oriental Especiado",
                "top_notes": "Folhas de Tabaco, Especiarias Nobres",
                "heart_notes": "Fava Tonka, Flor de Tabaco, Baunilha, Cacau",
                "base_notes": "Frutas Secas, Acordo de Madeiras Doces",
                "price": 2150.00,
                "promotional_price": 1950.00,
                "discount_percent": 9,
                "stock": 10,
                "sku": "TFD-TOB-004",
                "status": "active",
                "featured": False,
                "release": False,
                "bestseller": True,
                "images": [
                    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Parfums de Marly Delina Royal",
                "slug": "parfums-de-marly-delina-royal",
                "brand_id": b_marly.id,
                "category_id": cat_floral.id,
                "gender": "feminino",
                "description": "Um buquê floral hipnótico onde a rosa turca reina suprema, entrelaçada com lírio do vale, peônia e notas sutis de lichia e ruibarbo. O epítome da elegância feminina.",
                "volume_ml": 75,
                "concentration": "Eau de Parfum",
                "olfactory_family": "Floral Frutado Nobre",
                "top_notes": "Lichia, Ruibarbo, Bergamota, Noz-Moscada",
                "heart_notes": "Rosa Turca, Peônia, Lírio do Vale, Petália",
                "base_notes": "Baunilha, Almíscar Branco, Vetiver de Madagascar, Incenso",
                "price": 2290.00,
                "promotional_price": None,
                "discount_percent": 0,
                "stock": 6,
                "sku": "PDM-DEL-005",
                "status": "active",
                "featured": True,
                "release": True,
                "bestseller": False,
                "images": [
                    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Aurum Solar Neroli Prestige",
                "slug": "aurum-solar-neroli-prestige",
                "brand_id": b_aurum.id,
                "category_id": cat_citrico.id,
                "gender": "unissex",
                "description": "Inspirado nas tardes ensolaradas da Côte d'Azur. A efervescência do neroli de flor de laranjeira combinada com bergamota fresca e brisa marinha de sal azul.",
                "volume_ml": 100,
                "concentration": "Eau de Parfum",
                "olfactory_family": "Cítrico Aquático",
                "top_notes": "Neroli Tunisiano, Bergamota da Sicília, Mandarina",
                "heart_notes": "Flor de Laranjeira, Lavanda de Provença, Alecrim",
                "base_notes": "Âmbar Solar, Sândalo Branco, Almíscar",
                "price": 1490.00,
                "promotional_price": 1290.00,
                "discount_percent": 13,
                "stock": 15,
                "sku": "AUR-SOL-006",
                "status": "active",
                "featured": False,
                "release": True,
                "bestseller": False,
                "images": [
                    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
                ]
            }
        ]

        for pdata in products_data:
            imgs = pdata.pop("images")
            prod = Product(**pdata)
            db.add(prod)
            db.flush()

            for i, img_url in enumerate(imgs):
                pimg = ProductImage(
                    product_id=prod.id,
                    image_url=img_url,
                    is_primary=(i == 0),
                    display_order=i
                )
                db.add(pimg)

        # 5. Cupons
        c1 = Coupon(code="PRIMEIRA10", discount_type="percentage", discount_value=10.0, min_purchase=500.0, usage_limit=500, is_active=True)
        c2 = Coupon(code="PERFUME15", discount_type="percentage", discount_value=15.0, min_purchase=1000.0, usage_limit=200, is_active=True)
        c3 = Coupon(code="AURUM20", discount_type="fixed", discount_value=150.0, min_purchase=800.0, usage_limit=100, is_active=True)
        db.add_all([c1, c2, c3])

        # 6. Avaliações de Exemplo
        first_prod = db.query(Product).first()
        r1 = Review(
            product_id=first_prod.id,
            user_id=customer_user.id,
            rating=5,
            comment="Fixação espetacular que dura mais de 16 horas na pele. O cheiro transmite poder absoluto!"
        )
        db.add(r1)

        # 7. Pedido de Demonstração para alimentar estatísticas do Dashboard
        ord_num = f"AUR-20260909-MOCK01"
        mock_order = Order(
            order_number=ord_num,
            user_id=customer_user.id,
            status="delivered",
            payment_status="approved",
            subtotal=1690.00,
            shipping_cost=25.00,
            discount_amount=100.00,
            total=1615.00,
            payment_method="credit_card",
            shipping_address_json='{"street": "Alameda Santos", "number": "1470", "neighborhood": "Jardins", "city": "São Paulo", "state": "SP", "zip_code": "01415-000"}',
            shipping_method="Entrega Normal Expressa",
            tracking_code="BR884920194AUR"
        )
        db.add(mock_order)
        db.flush()

        ord_item = OrderItem(
            order_id=mock_order.id,
            product_id=first_prod.id,
            product_name=first_prod.name,
            product_sku=first_prod.sku,
            price=1690.00,
            quantity=1
        )
        db.add(ord_item)

        pay_rec = Payment(
            order_id=mock_order.id,
            method="credit_card",
            status="approved",
            transaction_id="TX-DEMO-994820",
            payload_json='{"card_brand": "Visa VIP Gold", "last4": "4000", "installments": "3x"}'
        )
        db.add(pay_rec)

        db.commit()
        print("=> Banco de dados semeado com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"Erro ao semear banco: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
