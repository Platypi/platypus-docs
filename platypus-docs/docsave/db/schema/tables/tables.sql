CREATE DATABASE  IF NOT EXISTS `%dbName%` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `%dbName%`;
-- MySQL dump 10.13  Distrib 5.6.17, for Win32 (x86)
--
-- Host: %hostName%   Database: %dbName%
-- ------------------------------------------------------
-- Server version	5.5.21-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `classproperties`
--

DROP TABLE IF EXISTS `classproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classproperties` (
  `classid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT NULL,
  `overridden` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`classid`,`propertyid`),
  KEY `cppropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `cpclassid_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cppropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaceinterfaces`
--

DROP TABLE IF EXISTS `interfaceinterfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaceinterfaces` (
  `interfaceid` int(11) NOT NULL,
  `extendsinterfaceid` int(11) NOT NULL,
  PRIMARY KEY (`interfaceid`,`extendsinterfaceid`),
  KEY `iiextendsi_fk_idx` (`extendsinterfaceid`),
  CONSTRAINT `iiextendsi_fk` FOREIGN KEY (`extendsinterfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `iiinterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `methods`
--

DROP TABLE IF EXISTS `methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  `remarks` text,
  `visibility` varchar(255) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `returntype` varchar(50) DEFAULT NULL,
  `returntypedesc` text,
  `returntypemethodid` int(11) DEFAULT NULL,
  `returntypeinterfaceid` int(11) DEFAULT NULL,
  `returntypeclassid` int(11) DEFAULT NULL,
  `returntypenamespaceid` int(11) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `optional` tinyint(1) DEFAULT '0',
  `abstract` tinyint(1) DEFAULT '0',
  `virtual` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT '0',
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `returntypeclass_ix` (`returntypeclassid`),
  KEY `returntypeinterface_ix` (`returntypeinterfaceid`),
  KEY `returntypemethod_ix` (`returntypemethodid`),
  KEY `returntypenamespace_ix` (`returntypenamespaceid`),
  CONSTRAINT `classmethod_fk` FOREIGN KEY (`returntypeclassid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfacemethod_fk` FOREIGN KEY (`returntypeinterfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `methodmethod_fk` FOREIGN KEY (`returntypemethodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `namespacemethod_fk` FOREIGN KEY (`returntypenamespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parameters`
--

DROP TABLE IF EXISTS `parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `methodid` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `methodtypeid` int(11) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `description` text,
  `defaultvalue` varchar(255) DEFAULT NULL,
  `optional` tinyint(1) DEFAULT NULL,
  `porder` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `methodtypeid_ix` (`methodtypeid`),
  KEY `classtypeid_ix` (`classtypeid`),
  KEY `interfacetypeid_ix` (`interfacetypeid`),
  KEY `pmethodid_fk_idx` (`methodid`),
  CONSTRAINT `classparam_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfaceparam_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `methodparam_fk` FOREIGN KEY (`methodtypeid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `pmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespaceproperties`
--

DROP TABLE IF EXISTS `namespaceproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespaceproperties` (
  `namespaceid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  PRIMARY KEY (`namespaceid`,`propertyid`),
  KEY `nppropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `npinterfaceid_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `nppropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaces`
--

DROP TABLE IF EXISTS `interfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `namespaceid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `remarks` text,
  `exported` tinyint(1) DEFAULT NULL,
  `registeredtype` varchar(255) DEFAULT NULL,
  `registeredname` varchar(255) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `namespace_ix` (`namespaceid`),
  CONSTRAINT `namespaceinterface_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1431 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaceproperties`
--

DROP TABLE IF EXISTS `interfaceproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaceproperties` (
  `interfaceid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`interfaceid`,`propertyid`),
  KEY `ippropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `ipinterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ippropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfacemethods`
--

DROP TABLE IF EXISTS `interfacemethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfacemethods` (
  `interfaceid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`interfaceid`,`methodid`),
  KEY `immethodid_fk_idx` (`methodid`),
  CONSTRAINT `iminterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `immethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) DEFAULT NULL,
  `namespaceid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  `remarks` text,
  `exported` tinyint(1) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `registeredtype` varchar(255) DEFAULT NULL,
  `registeredname` varchar(255) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  `usage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parentid_ix` (`parentid`),
  KEY `namespaceid_ix` (`namespaceid`),
  CONSTRAINT `namespaceclass_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `parentclass_fk` FOREIGN KEY (`parentid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1181 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `description` text,
  `remarks` text,
  `visibility` varchar(255) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `readonly` tinyint(1) DEFAULT NULL,
  `returntypedesc` text,
  `published` tinyint(1) DEFAULT '0',
  `methodtypeid` int(11) DEFAULT NULL,
  `optional` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classtype_ix` (`classtypeid`),
  KEY `methodtype_ix` (`interfacetypeid`),
  CONSTRAINT `classprop_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfaceprop_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8431 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespacemethods`
--

DROP TABLE IF EXISTS `namespacemethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespacemethods` (
  `namespaceid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  PRIMARY KEY (`namespaceid`,`methodid`),
  KEY `nmmethodid_fk_idx` (`methodid`),
  CONSTRAINT `nmmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `nmnamespaceid_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classmethods`
--

DROP TABLE IF EXISTS `classmethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classmethods` (
  `classid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT NULL,
  `overridden` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`classid`,`methodid`),
  KEY `cmmethod_fk_idx` (`methodid`),
  CONSTRAINT `cmclassid_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cmmethod_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classinterfaces`
--

DROP TABLE IF EXISTS `classinterfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classinterfaces` (
  `classid` int(11) NOT NULL,
  `interfaceid` int(11) NOT NULL,
  PRIMARY KEY (`classid`,`interfaceid`),
  KEY `ciinterfaceid_idx` (`interfaceid`),
  CONSTRAINT `ciclassid` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ciinterfaceid` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `typeparameters`
--

DROP TABLE IF EXISTS `typeparameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `typeparameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `interfaceid` int(11) DEFAULT NULL,
  `classid` int(11) DEFAULT NULL,
  `methodid` int(11) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `porder` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tpclasstypeid_fk_idx` (`classtypeid`),
  KEY `tpinterfacetypeid_fk_idx` (`interfacetypeid`),
  KEY `tpmethodid_fk_idx` (`methodid`),
  CONSTRAINT `tpclasstypeid_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tpinterfacetypeid_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tpmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespaces`
--

DROP TABLE IF EXISTS `namespaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespaces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parentid` (`parentid`),
  CONSTRAINT `parentns_fk` FOREIGN KEY (`parentid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `classid` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `remarks` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eventsclass_fk_idx` (`classid`),
  CONSTRAINT `eventsclass_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-10-01 15:10:58
CREATE DATABASE  IF NOT EXISTS `%dbName%` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `%dbName%`;
-- MySQL dump 10.13  Distrib 5.6.17, for Win32 (x86)
--
-- Host: %hostName%   Database: %dbName%
-- ------------------------------------------------------
-- Server version	5.5.21-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `classproperties`
--

DROP TABLE IF EXISTS `classproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classproperties` (
  `classid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT NULL,
  `overridden` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`classid`,`propertyid`),
  KEY `cppropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `cpclassid_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cppropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaceinterfaces`
--

DROP TABLE IF EXISTS `interfaceinterfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaceinterfaces` (
  `interfaceid` int(11) NOT NULL,
  `extendsinterfaceid` int(11) NOT NULL,
  PRIMARY KEY (`interfaceid`,`extendsinterfaceid`),
  KEY `iiextendsi_fk_idx` (`extendsinterfaceid`),
  CONSTRAINT `iiextendsi_fk` FOREIGN KEY (`extendsinterfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `iiinterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `methods`
--

DROP TABLE IF EXISTS `methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  `remarks` text,
  `visibility` varchar(255) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `returntype` varchar(50) DEFAULT NULL,
  `returntypedesc` text,
  `returntypemethodid` int(11) DEFAULT NULL,
  `returntypeinterfaceid` int(11) DEFAULT NULL,
  `returntypeclassid` int(11) DEFAULT NULL,
  `returntypenamespaceid` int(11) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `optional` tinyint(1) DEFAULT '0',
  `abstract` tinyint(1) DEFAULT '0',
  `virtual` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT '0',
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `returntypeclass_ix` (`returntypeclassid`),
  KEY `returntypeinterface_ix` (`returntypeinterfaceid`),
  KEY `returntypemethod_ix` (`returntypemethodid`),
  KEY `returntypenamespace_ix` (`returntypenamespaceid`),
  CONSTRAINT `classmethod_fk` FOREIGN KEY (`returntypeclassid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfacemethod_fk` FOREIGN KEY (`returntypeinterfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `methodmethod_fk` FOREIGN KEY (`returntypemethodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `namespacemethod_fk` FOREIGN KEY (`returntypenamespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parameters`
--

DROP TABLE IF EXISTS `parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `methodid` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `methodtypeid` int(11) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `description` text,
  `defaultvalue` varchar(255) DEFAULT NULL,
  `optional` tinyint(1) DEFAULT NULL,
  `porder` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `methodtypeid_ix` (`methodtypeid`),
  KEY `classtypeid_ix` (`classtypeid`),
  KEY `interfacetypeid_ix` (`interfacetypeid`),
  KEY `pmethodid_fk_idx` (`methodid`),
  CONSTRAINT `classparam_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfaceparam_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `methodparam_fk` FOREIGN KEY (`methodtypeid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `pmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespaceproperties`
--

DROP TABLE IF EXISTS `namespaceproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespaceproperties` (
  `namespaceid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  PRIMARY KEY (`namespaceid`,`propertyid`),
  KEY `nppropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `npinterfaceid_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `nppropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaces`
--

DROP TABLE IF EXISTS `interfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `namespaceid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `remarks` text,
  `exported` tinyint(1) DEFAULT NULL,
  `registeredtype` varchar(255) DEFAULT NULL,
  `registeredname` varchar(255) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `namespace_ix` (`namespaceid`),
  CONSTRAINT `namespaceinterface_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1431 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfaceproperties`
--

DROP TABLE IF EXISTS `interfaceproperties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfaceproperties` (
  `interfaceid` int(11) NOT NULL,
  `propertyid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`interfaceid`,`propertyid`),
  KEY `ippropertyid_fk_idx` (`propertyid`),
  CONSTRAINT `ipinterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ippropertyid_fk` FOREIGN KEY (`propertyid`) REFERENCES `properties` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interfacemethods`
--

DROP TABLE IF EXISTS `interfacemethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interfacemethods` (
  `interfaceid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`interfaceid`,`methodid`),
  KEY `immethodid_fk_idx` (`methodid`),
  CONSTRAINT `iminterfaceid_fk` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `immethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) DEFAULT NULL,
  `namespaceid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  `remarks` text,
  `exported` tinyint(1) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `registeredtype` varchar(255) DEFAULT NULL,
  `registeredname` varchar(255) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  `usage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parentid_ix` (`parentid`),
  KEY `namespaceid_ix` (`namespaceid`),
  CONSTRAINT `namespaceclass_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `parentclass_fk` FOREIGN KEY (`parentid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1181 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `description` text,
  `remarks` text,
  `visibility` varchar(255) DEFAULT NULL,
  `static` tinyint(1) DEFAULT NULL,
  `readonly` tinyint(1) DEFAULT NULL,
  `returntypedesc` text,
  `published` tinyint(1) DEFAULT '0',
  `methodtypeid` int(11) DEFAULT NULL,
  `optional` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classtype_ix` (`classtypeid`),
  KEY `methodtype_ix` (`interfacetypeid`),
  CONSTRAINT `classprop_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `interfaceprop_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8431 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespacemethods`
--

DROP TABLE IF EXISTS `namespacemethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespacemethods` (
  `namespaceid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  PRIMARY KEY (`namespaceid`,`methodid`),
  KEY `nmmethodid_fk_idx` (`methodid`),
  CONSTRAINT `nmmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `nmnamespaceid_fk` FOREIGN KEY (`namespaceid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classmethods`
--

DROP TABLE IF EXISTS `classmethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classmethods` (
  `classid` int(11) NOT NULL,
  `methodid` int(11) NOT NULL,
  `inherited` tinyint(1) DEFAULT NULL,
  `overridden` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`classid`,`methodid`),
  KEY `cmmethod_fk_idx` (`methodid`),
  CONSTRAINT `cmclassid_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cmmethod_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classinterfaces`
--

DROP TABLE IF EXISTS `classinterfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classinterfaces` (
  `classid` int(11) NOT NULL,
  `interfaceid` int(11) NOT NULL,
  PRIMARY KEY (`classid`,`interfaceid`),
  KEY `ciinterfaceid_idx` (`interfaceid`),
  CONSTRAINT `ciclassid` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ciinterfaceid` FOREIGN KEY (`interfaceid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `typeparameters`
--

DROP TABLE IF EXISTS `typeparameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `typeparameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `interfaceid` int(11) DEFAULT NULL,
  `classid` int(11) DEFAULT NULL,
  `methodid` int(11) DEFAULT NULL,
  `classtypeid` int(11) DEFAULT NULL,
  `interfacetypeid` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `porder` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tpclasstypeid_fk_idx` (`classtypeid`),
  KEY `tpinterfacetypeid_fk_idx` (`interfacetypeid`),
  KEY `tpmethodid_fk_idx` (`methodid`),
  CONSTRAINT `tpclasstypeid_fk` FOREIGN KEY (`classtypeid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tpinterfacetypeid_fk` FOREIGN KEY (`interfacetypeid`) REFERENCES `interfaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tpmethodid_fk` FOREIGN KEY (`methodid`) REFERENCES `methods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespaces`
--

DROP TABLE IF EXISTS `namespaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespaces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `description` text,
  `published` tinyint(1) DEFAULT '0',
  `deprecated` tinyint(1) DEFAULT NULL,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parentid` (`parentid`),
  CONSTRAINT `parentns_fk` FOREIGN KEY (`parentid`) REFERENCES `namespaces` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `classid` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `remarks` text,
  `example` text,
  `exampleurl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eventsclass_fk_idx` (`classid`),
  CONSTRAINT `eventsclass_fk` FOREIGN KEY (`classid`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-10-01 15:10:58
