#! /usr/bin/env python
# -*-coding: UTF-8-*-

from __future__ import unicode_literals
import random
import unittest


def get_id():
    get_id.id_count += 1
    return get_id.id_count
get_id.id_count = 0


class UnexpectedArg(Exception):
    pass


class Entity(object):
    # The following must be overridden in subclass:
    class_name = None
    link_fields = None  # list of attribute names
    entity_fields = None
    vs = 'aeiou'.split(None) + ['ai', 'ao', 'au', 'ey', 'ei', 'eo', 'oo']
    cs = 'bdfghklmnprstvw'.split(None) + ['sh', 'ch', 'th', 'sl']
    mids = ['%s%s' % (c, v) for c in cs for v in vs]
    random.shuffle(mids)
    ends = 'bdfghklmnprstvwz'.split(None) + ['ck', 'ty', 'to', 'ss', 'zz', '']

    def __init__(self, **kwargs):
        self.id = kwargs.pop('id', None) or get_id()
        if 'name' in self.link_fields and 'name' not in kwargs:
            k = self.id
            k_end = k % len(self.ends)
            xs = []
            while k:
                k, kk = divmod(k, len(self.mids))
                xs.append(kk)
            kwargs['name'] = (''.join(self.mids[x] for x in xs) + self.ends[k_end]).title()
        for n in self.link_fields:
            v = kwargs.pop(n)
            setattr(self, n, v)
        for n in self.entity_fields:
            v = kwargs.pop(n, None)
            setattr(self, n, v)
        if kwargs:
            raise UnexpectedArg('Did not expect %s' % kwargs.keys())

    def _update_collection_in_kwargs(self, collection_attr, reverse_attr, cls, kwargs, x_kwargs):
        """Called during __init__ to add colection to kwargs.
        """
        xs = list(kwargs.pop(collection_attr, []))

        for x in xs:
            setattr(x, reverse_attr, self)
        count_attr = collection_attr[:-1] + '_count'
        x_count = kwargs.get(count_attr, 0)
        if x_count:
            aargs = dict(x_kwargs)
            aargs[reverse_attr] = self
            xs.extend(cls(**aargs) for i in range(x_count))
        kwargs[collection_attr] = xs

    def file_name(self, suffix=''):
        return '%s%d%s.json' % (self.class_name, self.id, suffix)

    def __repr__(self):
        return ('<%s #%d%s>' % (
            self.__class__.__name__,
            self.id,
            ''.join(' %r' % (getattr(self, n),) for n in self.link_fields)))

    def to_link_obj(self):
        return _to_obj_2(self, max_depth=0)

    def to_entity_obj(self, max_depth=1):
        return _to_obj_2(self, max_depth=max_depth)


def _to_obj_2(x, depth=0, seen=None, max_depth=None):
    if not isinstance(x, Entity):
        raise TypeError('Expected Entity, got %r' % (x,))
    was_seen = seen and x in seen
    if not seen:
        seen = {x}
    else:
        seen.add(x)
    obj = {'href': x.file_name()}
    ns = x.link_fields
    if not (was_seen or max_depth is not None and depth >= max_depth):
        ns = x.link_fields + x.entity_fields
    for n in ns:
        v = getattr(x, n, None)
        if v is None or (isinstance(v, Entity) and v in seen):
            continue
        elif isinstance(v, (basestring, int, float, bool)):
            obj[n] = v
        elif isinstance(v, Entity):
            obj[n] = _to_obj_2(v, depth + 1, seen, max_depth)
        elif hasattr(v, '__iter__'):
            obj[n] = {
                'href': x.file_name('-%s' % (n,)),
            }
            if max_depth is None or depth + 1 < max_depth:
                obj[n]['items'] = [_to_obj_2(e, depth + 2, seen, max_depth) for e in v]
        else:
            raise TypeError('Don’t know how to objectify %n=%r' % (n, v))
    return obj


class Kit(Entity):
    class_name = 'kit'
    link_fields = ['name']
    entity_fields = ['fluffiness', 'cat']
    ends = Entity.ends + ['ff', 'ffle', 'fflepaws', 'kins', 'dles']

    def __init__(self, **kwargs):
        super(Kit, self).__init__(**kwargs)
        if self.cat and self not in self.cat.kits:
            self.cat.kits.append(self)


class Cat(Entity):
    class_name = 'cat'
    link_fields = ['name']
    entity_fields = ['aloofness', 'sack', 'kits']
    ends = Entity.ends + ['fang']

    def __init__(self, **kwargs):
        self._update_collection_in_kwargs('kits', 'cat', Kit, kwargs, {})
        super(Cat, self).__init__(**kwargs)
        if self.sack and self not in self.sack.cats:
            self.sack.cats.append(self)


class Sack(Entity):
    class_name = 'sack'
    link_fields = []
    entity_fields = ['holder', 'cats']

    def __init__(self, kit_count=0, **kwargs):
        self._update_collection_in_kwargs('cats', 'sack', Cat, kwargs, {})
        super(Sack, self).__init__(**kwargs)
        if self.holder and self not in self.holder.sacks:
            self.holder.sacks.append(self)


class Person(Entity):
    class_name = 'person'
    link_fields = ['name']
    entity_fields = ['sacks', 'spouses', 'index']

    def __init__(self, cat_count=0, kit_count=0, **kwargs):
        self._update_collection_in_kwargs('sacks', 'holder', Sack, kwargs, {})
        super(Person, self).__init__(**kwargs)
        if not self.spouses:
            self.spouses = []
        else:
            self.spouses = list(self.spouses)
            blob = {self} | set(self.spouses)
            for x in self.spouses:
                blob |= set(x.spouses)
            for x in blob:
                x.spouses.extend(blob - set(x.spouses) - {x})


class Index(Entity):
    """The index page has lists of people & not much else."""
    class_name = 'index'
    link_fields = []
    entity_fields = ['persons']

    def __init__(self, kit_count=0, **kwargs):
        self._update_collection_in_kwargs('persons', 'index', Cat, kwargs, {})
        super(Index, self).__init__(**kwargs)

    def file_name(self, suffix=''):
        return 'index%s.json' % (suffix,)


class TestKit(unittest.TestCase):
    def test_has_name_by_default(self):
        kit = Kit()

        self.assertTrue(kit.name)

    def test_has_no_fluffiness_by_default(self):
        kit = Kit()

        self.assertIsNone(kit.fluffiness)

    def test_can_make_obj(self):
        kit = Kit(name='Tiddles', fluffiness=17)

        obj = kit.to_entity_obj()

        self.assertEqual(obj['name'], 'Tiddles')
        self.assertEqual(obj['fluffiness'], 17)

    def test_includes_link_to_cat_by_default(self):
        cat = Cat(name='Fangwhiskers', aloofness=87)
        kit = Kit(cat=cat)

        obj = kit.to_entity_obj()

        self.assertEqual(obj['cat']['name'], 'Fangwhiskers')
        self.assertIn('href', obj['cat'])
        self.assertNotIn('aloofness', obj['cat'])

    def test_includes_embedded_cat_if_requested(self):
        sack = Sack()
        cat = Cat(aloofness=69, sack=sack)
        kit = Kit(cat=cat)

        obj = kit.to_entity_obj(max_depth=2)

        self.assertEqual(obj['cat']['aloofness'], 69)
        self.assertIn('href', obj['cat']['sack'])

    def test_adds_self_to_cat_if_created_second(self):
        cat = Cat()
        kit = Kit(cat=cat)

        self.assertIn(kit, cat.kits)

    def test_acquires_cat_if_created_first(self):
        kit = Kit()
        cat = Cat(kits=[kit])

        self.assertIs(kit.cat, cat)


class TestCat(unittest.TestCase):
    def test_adds_self_to_sack(self):
        sack = Sack()
        cat = Cat(sack=sack)

        self.assertIn(cat, sack.cats)

    def test_acquires_sack(self):
        cat = Cat()
        sack = Sack(cats=[cat])

        self.assertIs(sack, cat.sack)

    def test_obj_kits_dont_link_to_cat(self):
        cat = Cat(kits=[Kit(name='Tiddles'), Kit(name='Whiskers')])

        obj = cat.to_entity_obj(max_depth=2)

        items = obj['kits']['items']
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['name'], 'Tiddles')
        self.assertNotIn(cat, items[0])


class TestSack(unittest.TestCase):
    def test_adds_self_to_person(self):
        person = Person()
        sack = Sack(holder=person)

        self.assertIn(sack, person.sacks)

    def test_acquires_holder(self):
        sack = Sack()
        person = Person(sacks=[sack])

        self.assertIs(sack.holder, person)


class TestSpouses(unittest.TestCase):
    def test_marriage_is_symmetric(self):
        alice = Person(name='Alice')
        bob = Person(name='Bob', spouses=[alice])

        self.assertIn(bob, alice.spouses)

    def test_marriage_is_transitive(self):
        alice = Person(name='Alice')
        bob = Person(name='Bob', spouses=[alice])
        charley = Person(name='Charley', spouses=[alice])

        self.assertIn(bob, charley.spouses)
        self.assertIn(charley, bob.spouses)

    def test_doesnt_marry_people_to_themselves(self):
        # We go for the marrigage-blob model,
        # where in this exapython mple Alice is married to Bob
        # via the path Alice-Fang-Charley-Greta-Bob.
        a, b, c, d, e = [Person(name=x) for x in ['alice', 'bob', 'charley', 'deep', 'eve']]
        f = Person(name='fang', spouses=[a, c, e])
        g = Person(name='graham', spouses=[b, c, d])

        all_persons = set([a, b, c, d, e, f, g])
        for x in all_persons:
            self.assertEqual(len(x.spouses), 6)
            self.assertEqual(set(x.spouses) | {x}, all_persons)

    def test_dont_let_unofficial_liaisons_confuse_matters(self):
        # This copies code I made to generate some data:
        ps = [Person(name='Alice'), Person(name='Bob')]
        ps.append(Person(name='Deepak', spouses=ps))
        ps.append(Person(name='Charley'))

        # Check this doesn’t accidentally add Charley as a spoise of Alice et al.
        self.assertNotIn(ps[3], ps[2].spouses)


if __name__ == '__main__':
    import json

    ps = [Person(name='Alice'), Person(name='Bob')]
    ps.append(Person(name='Deepak', spouses=ps))
    ps.append(Person(name='Charley'))

    ss = [Sack(holder=random.choice(ps)) for _ in range(6)]
    ns = [x.strip() for x in """
        Lucky   Oscar Max Bella Tiger   Molly Sam Max Misty   Coco
        Simba Milo Coco    Angel Chloe   Tigger Lucy    Missy Missy
        Lily Tigmokey Misty Tigger Kitty Oscar Missy Max Ginger Molly
        Felix Smudge Sooty Tigger Charlie Alfie Oscar Millie Molly
        Charlie Tigger Poppy Oscar Smudge Millie Daisy Max Jasper
        Misty Charlie Milly Oscar Tiger Poppy Sophie Rosie Smudge
        Lucy Felix Minka Moritz Charly Tiger Max Susi Lisa Blacky
        Muschi Minou Nabi Grisou Ti-Mine Félix Caramel Mimi Pacha
        Charlotte Minette Chanel Tiddles
        """.split()]
    cs = [Cat(name=n, sack=random.choice(ss), aloofness=random.randint(5, 15)) for n in ns[:20]]
    ks = [Kit(name=n, cat=random.choice(cs), fluffiness=random.randint(3, 10)) for n in ns[20:]]

    for p in ps + ss + cs + ks + [Index(persons=ps)]:
        with open(p.file_name(), 'wb') as strm:
            json.dump(p.to_entity_obj(max_depth=2), strm, indent=4)
