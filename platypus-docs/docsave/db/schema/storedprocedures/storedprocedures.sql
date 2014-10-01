CREATE DATABASE  IF NOT EXISTS `%dbName%` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `%dbName%`;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteClass`(classid int)
begin

	delete from classes
		where id = classid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteClassInterface`(classid int)
begin

	delete from classinterfaces
		where classid = classid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteInterface`(interfaceid int)
begin

	delete from interfaces
		where id = interfaceid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteInterfaceFromClass`(cid int,
iid int)
BEGIN

	delete from classinterfaces
	where classid = cid and interfaceid = iid;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteInterfaceInterface`(interfaceid int)
begin

	delete from interfaceinterfaces
		where interfaceid = interfaceid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteMethod`(methodid int)
begin

	delete from methods
		where id = methodid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteNamespace`(namespaceid int)
begin

	delete from namespaces
		where id = namespaceid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteParameter`(parameterid int)
begin

	delete from parameters
		where id = parameterid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `DeleteProperty`(propertyid int)
begin

	delete from properties
		where id = propertyid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetClass`(
	classid int,
	overloads boolean
)
begin
	create temporary table tree
		(id int,
		parentid int,
		namespaceid int,
		name varchar(255),
		description text,
		example text,
		exampleurl varchar(255),
		remarks text,
		exported boolean,
		static boolean,
		registeredtype varchar(255),
		registeredname varchar(255),
		published boolean,
		torder int);

	set @pid = classid;
	set @torder = 1;

	insert into tree
		(id, 
		parentid, 
		name, 
		description, 
		example, 
		exampleurl, 
		remarks,
		exported, 
		static, 
		registeredtype, 
		registeredname, 
		published, 
		torder)
	select 
		t.id, 
		@pid := t.parentid as parentid, 
		t.name, 
		t.description,
		t.example,
		t.exampleurl,
		t.remarks,
		t.exported,
		t.static,
		t.registeredtype,
		t.registeredname,
		t.published,
		0
	from classes t
	where id = classid;

	while @pid != classid and isnull(@pid) = false do
		
		insert into tree
			(id, 
			parentid, 
			name, 
			description, 
			example, 
			exampleurl, 
			remarks,
			exported, 
			static, 
			registeredtype, 
			registeredname, 
			published, 
			torder)
		select 
			t.id, 
			@pid := t.parentid as parentid, 
			t.name, 
			null, 
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null, 
			@torder
		from classes t
		where t.id = @pid;

		set @torder = @torder + 1;
	end while;

	select * from tree order by torder desc;

	drop table tree;

	/* class namespace */
	select n.id, n.name
		from namespaces n
		where n.id = (select namespaceid 
						from classes
						where id = classid);

	/* classes inherited from classid */
	select c.id, c.name, c.description
		from classes c
		where c.parentid = classid
		order by c.name;

	/* all implemented interfaces */
	select i.id, i.name, i.description
		from interfaces i
		inner join classinterfaces ci on ci.interfaceid = i.id
		where ci.classid = classid
		order by i.name;

	/* class methods */
	if overloads then
		select m.name, m.id, m.description, m.visibility, m.static, cm.inherited, cm.overridden
			from methods m
			inner join classmethods cm on cm.methodid = m.id
			where cm.classid = classid
			order by m.name;
	else
		select distinct m.name, m.id, m.description, m.visibility, m.static, cm.inherited, cm.overridden, count(m.name) > 1 as overloaded
			from methods m
			inner join classmethods cm on cm.methodid = m.id
			where cm.classid = classid
			group by m.name
			order by m.name;
	end if;

	/* class method params */
	select m.id, p.name
		from methods m
		inner join parameters p on m.id = p.methodid
		inner join classmethods cm on cm.methodid = m.id
		inner join classes c on c.id = cm.classid
		where c.id = classid
		order by m.name, m.id, p.porder;

	/* class method type parameters */
	select m.id, tp.name
		from methods m
		inner join typeparameters tp on m.id = tp.methodid
		inner join classmethods cm on cm.methodid = m.id
		inner join classes c on c.id = cm.classid
		where c.id = classid
		order by m.name, m.id, tp.porder;

	/* classproperties */
	select p.id, p.name, p.description, p.type, p.classtypeid, p.interfacetypeid, p.visibility, p.static, p.readonly, cp.inherited, cp.overridden
		from properties p
		inner join classproperties cp on cp.propertyid = p.id
		where cp.classid = classid
		order by p.name;

	/* typeparameters */
	select tp.id, tp.name, tp.description
		from typeparameters tp
		inner join classes c on c.id = tp.classid
		where c.id = classid;

	/* events */
	select e.id, e.name, e.description
			from events e
			inner join classes c on c.id = e.classid
			where c.id = classid
			order by e.name;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetClasses`(
	startingrow int,
	rowcount int
)
BEGIN

	if(rowcount = 0) then
		set rowcount = 2147483647;
	end if;

	select id, name from classes
		order by name
		limit startingrow, rowcount;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetInterface`(
	interfaceid int,
	overloads boolean
)
begin

	/* the interface */
	select * from interfaces i
		where i.id = interfaceid;

	/* extended interfaces */
	select id, name
		from interfaceinterfaces ii
		inner join interfaces i on ii.extendsinterfaceid = i.id
		where ii.interfaceid = interfaceid;

	/* namespace */
	select n.id, n.name
		from namespaces n
		inner join interfaces i on i.namespaceid = n.id
		where i.id = interfaceid;

	/* the interface's methods */
	if overloads then
		select m.name, m.id, m.description
			from methods m
			inner join interfacemethods cm on cm.methodid = m.id
			where cm.interfaceid = interfaceid
			order by m.name;
	else
		select distinct m.name, m.id, m.description, count(m.name) > 1 as overloaded
			from methods m
			inner join interfacemethods cm on cm.methodid = m.id
			where cm.interfaceid = interfaceid
			group by m.name
			order by m.name;
	end if;


	/* the interface's properties */
	select p.id, p.name, p.description
		from properties p
		inner join interfaceproperties cp on cp.propertyid = p.id
		where cp.interfaceid = interfaceid
		order by p.name;

	/* type parameters */
	select tp.id, tp.name, tp.description
		from typeparameters tp
		inner join interfaces i on i.id = tp.interfaceid
		where i.id = interfaceid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetInterfaces`(
	startingrow int,
	rowcount int
)
BEGIN

	if(rowcount = 0) then
		set rowcount = 2147483647;
	end if;

	select id, name from interfaces
		order by name
		limit startingrow, rowcount;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetMethod`(
	methodid int
)
begin

	/* method details */
	select * from methods m
		where m.id= methodid;

	/* method source */	
	select i.id, i.name, 'interface' as doctype
		from interfaces i
		inner join interfacemethods im on i.id = im.interfaceid
		where im.methodid = methodid
	UNION ALL
	select n.id, n.name, 'namespace' as doctype
		from namespaces n
		inner join namespacemethods nm on nm.namespaceid = n.id
		where nm.methodid = methodid
	UNION all
	select c.id, c.name, 'class' as doctype
		from classes c
		inner join classmethods cm on cm.classid = c.id
		where cm.methodid = methodid;

	/* parameters */
	select p.*
		from parameters p
		inner join methods m on p.methodid = m.id
		where m.id = methodid
		order by p.porder asc;

	/* type parameters */
	select tp.id, tp.name, tp.description
		from typeparameters tp 
		inner join methods m on m.id = tp.methodid
		where m.id = methodid
		order by porder asc;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetNamespace`(
	namespaceid int,
	overloads boolean
)
begin

	create temporary table tree
	(id int,
	parentid int,
	name varchar(255),
	description text,
	published boolean,
	torder int);

	set @pid = namespaceid;
	set @torder = 1;

	insert into tree(id, parentid, name, description, published, torder)
	select t.id, @pid := t.parentid as parentid, t.name, t.description, t.published, 0
		from namespaces t
		where id = namespaceid;

	while @pid != namespaceid and isnull(@pid) = false do
		
		insert into tree(id, parentid, name, description, published, torder)
		select t.id, @pid := t.parentid as parentid, t.name, null, t.published, @torder
			from namespaces t
			where t.id = @pid;

		set @torder = @torder + 1;
	end while;

	/* ancestors */
	select * from tree order by torder desc;

	drop table tree;
	
	/* first level child namespaces */
	select n.id, n.name, n.description
		from namespaces n
		where n.parentid = namespaceid
		order by n.name;	


	/* child classes */
	select c.id, c.name, c.description
		from classes c
		where c.namespaceid = namespaceid
		order by c.name;

	/* child interfaces */
	select i.id, i.name, i.description
		from interfaces i
		where i.namespaceid = namespaceid
		order by i.name;

	/* child methods */
	if overloads then
		select m.name, m.id, m.description
			from methods m
			inner join namespacemethods nm on nm.methodid = m.id
			where nm.namespaceid = namespaceid
			order by m.name;
	else
		select distinct m.name, m.id, m.description, count(m.name) > 1 as overloaded
			from methods m
			inner join namespacemethods nm on nm.methodid = m.id
			where nm.namespaceid = namespaceid
			group by m.name
			order by m.name;
	end if;

	/* child properties */
	select p.id, p.name, p.description
		from properties p
		inner join namespaceproperties np on np.propertyid = p.id
		where np.namespaceid = namespaceid
		order by p.name;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetNamespaces`(
	startingrow int,
	rowcount int
)
BEGIN

	if(rowcount = 0) then
		set rowcount = 2147483647;
	end if;

	select id, name from namespaces
		order by name
		limit startingrow, rowcount;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetParameter`(
	id int
)
begin

	select * from parameters p
		where p.id= id;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `GetProperty`(
	propertyid int
)
begin

	/* the property */
	select * from properties p
		where p.id = propertyid;

	/* property source */	
	select i.id, i.name, 'interface' as doctype
		from interfaces i
		inner join interfaceproperties ip on i.id = ip.interfaceid
		where ip.propertyid = propertyid
	UNION ALL
	select n.id, n.name, 'namespace' as doctype
		from namespaces n
		inner join namespaceproperties np on np.namespaceid = n.id
		where np.propertyid = propertyid
	UNION all
	select c.id, c.name, 'class' as doctype
		from classes c
		inner join classproperties cp on cp.classid = c.id
		where cp.propertyid = propertyid;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertClass`(
	parentid int, 
	namespaceid int, 
	name varchar(255), 
	description text, 
	example text, 
	exampleurl varchar(255), 
	remarks text, 
	`usage` varchar(255), 
	exported boolean, 
	static boolean, 
	registeredtype varchar(255), 
	registeredname varchar(255)
)
BEGIN

	INSERT INTO classes
		(parentid,
		namespaceid,
		name,
		description,
		example,
		exampleurl,
		remarks,
		`usage`,
		exported,
		static,
		registeredtype,
		registeredname)
	VALUES
	(parentid,
		namespaceid,
		name,
		description,
		example,
		exampleurl,
		remarks,
		`usage`,
		exported,
		static,
		registeredtype,
		registeredname);

	set @ret_id = last_insert_id();

	call UpdateAbsoluteClassName(@ret_id);

	select @ret_id as id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertClassInterface`(
	classid int,
	interfaceid int
)
begin

	insert into classinterfaces(classid, interfaceid) values (classid, interfaceid);

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertEvent`(
	classid int,
	name varchar(255),
	description text,
	remarks text,
	example text,
	exampleurl varchar(255)
)
begin

	insert into events
		(classid, 
		name,
		description,
		remarks,
		example,
		exampleurl) 
	values 
		(classid, 
		name,
		description,
		remarks,
		example,
		exampleurl);

	select last_insert_id() as id;

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertInterface`(
	namespaceid int,
	name varchar(255),
	description text,
	remarks text,
	exported boolean,
	registeredtype varchar(255),
	registeredname varchar(255),
	deprecated boolean,
	version varchar(20)
)
BEGIN

	INSERT INTO interfaces
		(namespaceid,
		name,
		description,
		remarks,
		exported,
		registeredtype,
		registeredname,
		deprecated,
		version)
	VALUES
		(namespaceid,
		name,
		description,
		remarks,
		exported,
		registeredtype,
		registeredname,
		deprecated,
		version);

	set @ret_id = last_insert_id();

	call UpdateAbsoluteInterfaceName(@ret_id);

	select @ret_id as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertInterfaceInterface`(
	interfaceid int,
	extendsinterfaceid int
)
begin

	insert into interfaceinterfaces(interfaceid, extendsinterfaceid) values (interfaceid, extendsinterfaceid);

end$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertMethod`(	
		namespaceid int,
		classid int,
		interfaceid int,
		name varchar(255),
		description text,
		example text,
		exampleurl varchar(255),
		remarks text,
		visibility varchar(255),
		static boolean,
		returntype varchar(50),
		returntypedesc text,
		returntypemethodid int,
		returntypeinterfaceid int,
		returntypeclassid int,
		returntypenamespaceid int,
		overrides boolean,
		optional boolean,
		deprecated boolean,
		version varchar(20)
)
BEGIN

	INSERT INTO platypiwebdev.methods
		(name,
		description,
		example,
		exampleurl,
		remarks,
		visibility,
		static,
		returntype,
		returntypedesc,
		returntypemethodid,
		returntypeinterfaceid,
		returntypeclassid,
		returntypenamespaceid,
		optional,
		deprecated,
		version)
	VALUES
		(name,
		description,
		example,
		exampleurl,
		remarks,
		visibility,
		static,
		returntype,
		returntypedesc,
		returntypemethodid,
		returntypeinterfaceid,
		returntypeclassid,
		returntypenamespaceid,
		optional,
		deprecated,
		version);

	SET @methodid = last_insert_id();

	if(not isnull(namespaceid)) then
		insert into namespacemethods (namespaceid, methodid) values (namespaceid, @methodid);
	end if;

	if(not isnull(classid)) then
		insert into classmethods (classid, methodid) values (classid, @methodid);
	end if;	

	if(not isnull(interfaceid)) then
		insert into interfacemethods (interfaceid, methodid) values (interfaceid, @methodid);
	end if;

	call UpdateAbsoluteMethodName(@methodid);

	select @methodid as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertNamespace`(
	parentid int,
	name varchar(255),
	description text,
	deprecated boolean,
	version varchar(20)
)
BEGIN

	INSERT INTO namespaces
		(parentid,
		name,
		description,
		deprecated,
		version)
	VALUES
		(parentid,
		name,
		description,
		deprecated,
		version);

	set @ret_id = last_insert_id();

	call UpdateAbsoluteNamespaceName(@ret_id);

	select @ret_id as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertParameter`(
	methodid int,
	name varchar(255),
	type varchar(255),
	methodtypeid int,
	classtypeid int,
	interfacetypeid int,
	description text,
	defaultvalue varchar(255),
	optional boolean,
	porder int
)
BEGIN

	INSERT INTO platypiwebdev.parameters(	
		methodid,
		name,
		type,
		methodtypeid,
		classtypeid,
		interfacetypeid,
		description,
		defaultvalue,
		optional,
		porder)
	VALUES(
		methodid,
		name,
		type,
		methodtypeid,
		classtypeid,
		interfacetypeid,
		description,
		defaultvalue,
		optional,
		porder);

	select last_insert_id() as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertProperty`(
		namespaceid int,
		classid int,
		interfaceid int,
		name varchar(255),
		type varchar(255),		
		classtypeid int,
		interfacetypeid int,
		methodtypeid int,
		description text,
		remarks text,
		visibility varchar(255),
		static boolean,
		readonly boolean,
		returntypedesc text,
		overrides boolean,
		optional boolean
)
BEGIN

	INSERT INTO platypiwebdev.properties
		(name,
		type,
		classtypeid,
		interfacetypeid,
		methodtypeid,
		description,
		remarks,
		visibility,
		static,
		readonly,
		returntypedesc,
		optional)
	VALUES
		(name,
		type,
		classtypeid,
		interfacetypeid,
		methodtypeid,
		description,
		remarks,
		visibility,
		static,
		readonly,
		returntypedesc,
		optional);
	
	SET @propertyid = last_insert_id();

	if(not isnull(namespaceid)) then
		insert into namespaceproperties (namespaceid, propertyid) values (namespaceid, @propertyid);
	end if;

	if(not isnull(classid)) then
		insert into classproperties (classid, propertyid) values (classid, @propertyid);
	end if;	

	if(not isnull(interfaceid)) then
		insert into interfaceproperties (interfaceid, propertyid) values (interfaceid, @propertyid);
	end if;

	call UpdateAbsolutePropertyName(@propertyid);

	select @propertyid as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `InsertTypeParameter`(
	interfaceid int,
	classid int,
	methodid int,
	classtypeid int,
	interfacetypeid int,
	name varchar(255),
	description text,
	porder int
)
BEGIN

	INSERT INTO typeparameters(	
		interfaceid,
		classid,
		methodid,
		classtypeid,
		interfacetypeid,
		name,
		description,
		porder)
	VALUES(
		interfaceid,
		classid,
		methodid,
		classtypeid,
		interfacetypeid,
		name,
		description,
		porder);

	select last_insert_id() as id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateClass`(
	id int,
	parentid int, 
	namespaceid int, 
	name varchar(255), 
	description text, 
	example text, 
	exampleurl varchar(255), 
	remarks text, 
	`usage` varchar(255), 
	exported boolean, 
	static boolean, 
	registeredtype varchar(255), 
	registeredname varchar(255)
)
begin

	UPDATE classes c
		SET
			c.parentid = ifnull(parentid, c.parentid),
			c.namespaceid = namespaceid,
			c.name =  name,
			c.description = description,
			c.example = example,
			c.exampleurl = exampleurl,
			c.remarks = remarks,
			c.usage = `usage`, 
			c.exported = exported,
			c.static = static,
			c.registeredtype = registeredtype,
			c.registeredname = registeredname
		where
			c.id = id;
			
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateInterface`(
	id int,
	namespaceid int,
	name varchar(255),
	description text,
	remarks text,
	exported boolean,
	registeredtype varchar(255),
	registeredname varchar(255),
	deprecated boolean,
	version varchar(20)
)
begin

	UPDATE interfaces i
		SET
			i.namespaceid = namespaceid,
			i.name =  name,
			i.description = description,
			i.remarks = remarks,
			i.exported = exported,
			i.registeredtype = registeredtype,
			i.registeredname = registeredname
		where
			i.id = id;
			
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateMethod`(
		id int,
		namespaceid int,
		classid int,
		interfaceid int,
		name varchar(255),
		description text,
		example text,
		exampleurl varchar(255),
		remarks text,
		visibility varchar(255),
		static boolean,
		returntype varchar(50),
		returntypedesc text,
		returntypemethodid int,
		returntypeinterfaceid int,
		returntypeclassid int,
		returntypenamespaceid int,
		overrides boolean,
		optional boolean,
		deprecated boolean,
		version varchar(20)
)
begin

	UPDATE methods m
		SET			
			m.name =  name,
			m.description = description,
			m.example = example,
			m.exampleurl = exampleurl,
			m.remarks = remarks,
			m.visibility = visibility,
			m.static = static,
			m.returntype = returntype,
			m.returntypedesc = returntypedesc,
			m.returntypemethodid = returntypemethodid,
			m.returntypeinterfaceid = returntypeinterfaceid,
			m.returntypeclassid = returntypeclassid,
			m.returntypenamespaceid = returntypenamespaceid,
			m.optional = optional
		where
			m.id = id;
			
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateNamespace`(
	id int,
	parentid int,
	name varchar(255),
	description text
)
begin

	UPDATE namespaces n
		SET
			n.parentid = ifnull(parentid, n.parentid),
			n.name =  name,
			n.description = description
		where
			n.id = id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateParameter`(
	id int,
	methodid int,
	name varchar(255),
	type varchar(255),
	methodtypeid int,
	classtypeid int,
	interfacetypeid int,
	description text,
	defaultvalue varchar(255),
	optional boolean,
	porder int)
begin

	UPDATE parameters p
		SET
			p.methodid = methodid,
			p.name =  name,
			p.type = type,			
			p.methodtypeid = methodtypeid,
			p.classtypeid = classtypeid,
			p.interfacetypeid = interfacetypeid,
			p.description = description,
			p.defaultvalue = defaultvalue,
			p.optional = optional,
			p.porder = porder
		where
			p.id = id;
			
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`%userName%`@`%` PROCEDURE `UpdateProperty`(
		id int,
		namespaceid int,
		classid int,
		interfaceid int,
		name varchar(255),
		type varchar(255),
		classtypeid int,
		interfacetypeid int,
		methodtypeid int,
		description text,
		remarks text,
		visibility varchar(255),
		static boolean,
		readonly boolean,
		returntypedesc text,
		overrides boolean,
		optional boolean
)
begin

	UPDATE properties p
		SET
			p.name = name,
			p.type = type,
			p.classtypeid = classtypeid,
			p.interfacetypeid = interfacetypeid,
			p.methodtypeid = methodtypeid,
			p.description = description,
			p.remarks = remarks,
			p.visibility = visibility,
			p.static = static,
			p.readonly = readonly,
			p.returntypedesc = returntypedesc,
			p.optional = optional
		where
			p.id = id;
		

	if overrides then
		update classproperties cp
		set
			cp.overridden = overrides
		where
			cp.propertyid = id;
	end if;

END$$
DELIMITER ;
