-- MySQL dump 10.13  Distrib 5.5.31, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: unht
-- ------------------------------------------------------
-- Server version	5.5.31-0ubuntu0.13.04.1

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
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `uid` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `email_address` varchar(255) DEFAULT NULL,
  `new_email_address` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `password_salt` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domains`
--

DROP TABLE IF EXISTS `domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domains` (
  `host` varchar(255) NOT NULL,
  `uid` MEDIUMINT NOT NULL,
  `admin` varchar(255) DEFAULT NULL,
  `tech` varchar(255) DEFAULT NULL,
  `ns` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`host`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domains`
--

LOCK TABLES `domains` WRITE;
/*!40000 ALTER TABLE `domains` DISABLE KEYS */;
/*!40000 ALTER TABLE `domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zones`
--

DROP TABLE IF EXISTS `zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zones` (
  `host` varchar(255) NOT NULL,
  `uid` MEDIUMINT NOT NULL,
  `editkey` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`host`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zones`
--

LOCK TABLES `zones` WRITE;
/*!40000 ALTER TABLE `zones` DISABLE KEYS */;
/*!40000 ALTER TABLE `zones` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sites` (
  `host` varchar(255) NOT NULL,
  `uid` MEDIUMINT NOT NULL,
  PRIMARY KEY (`host`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remotestorage`
--

DROP TABLE IF EXISTS `remotestorage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `remotestorage` (
  `id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `server` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `uid` MEDIUMINT NOT NULL,
  `quota` int(11) DEFAULT NULL,
  PRIMARY KEY(`id`),
  UNIQUE INDEX(`server`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remotestorage`
--

LOCK TABLES `remotestorage` WRITE;
/*!40000 ALTER TABLE `remotestorage` DISABLE KEYS */;
/*!40000 ALTER TABLE `remotestorage` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `rstokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rstokens` (
  `uid` MEDIUMINT NOT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY(`uid`, `origin`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rstokens`
--

LOCK TABLES `rstokens` WRITE;
/*!40000 ALTER TABLE `rstokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `rstokens` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `uid` MEDIUMINT NOT NULL,
  `token` varchar(255),
  `is_a_password_reset_session` boolean default false
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remotestorage`
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-06-06 10:38:26
